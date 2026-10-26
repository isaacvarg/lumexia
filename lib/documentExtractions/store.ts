import { randomUUID } from "crypto";
import type { Db } from "@/lib/canon/db";
import { requiredKeysFor, resolveKeys } from "./catalog";
import { prepareFact } from "./validate";
import { carryVerification, computeReviewState, factIdentity, missingRequiredKeys } from "./review";
import type { ExtractionConflict, FactInput, PreparedFact } from "./types";

// Writing extractions. Every function takes the transaction runWrite gives it, so a dry run goes through
// exactly the same code and rolls back. Agents write and correct; they never verify, and never touch facts
// a person wrote (method human).

export class ExtractionRefused extends Error {
  constructor(message: string, readonly details?: unknown) {
    super(message);
  }
}

export type ExtractionActor = { userId: string; apiKeyId?: string | null; onBehalfOfId?: string | null };

// One writer per content at a time, so two calls can't both create the current extraction.
const lockContent = (db: Db, sha256: string) => db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`document-extraction:${sha256}`}))`;

const prepareAll = async (db: Db, facts: FactInput[]) => {
  const { resolved, unknown, deprecated } = await resolveKeys(db, facts.map((f) => f.key));
  if (unknown.length || deprecated.length) {
    throw new ExtractionRefused(
      [
        unknown.length ? `Unknown keys: ${unknown.join(", ")}. Create them with create_fact_definition (or use an existing key from list_fact_definitions).` : "",
        deprecated.length ? `Deprecated keys: ${deprecated.join(", ")}; see list_fact_definitions for their replacements.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  const prepared: PreparedFact[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  facts.forEach((input, i) => {
    const check = prepareFact(resolved.get(input.key)!, input);
    if ("errors" in check) errors.push(...check.errors.map((e) => `facts[${i}] ${e}`));
    else {
      prepared.push(check.fact);
      warnings.push(...check.warnings.map((w) => `facts[${i}] ${w}`));
    }
  });
  if (errors.length) throw new ExtractionRefused(`Some facts don't fit their keys:\n${errors.join("\n")}`, { errors });
  return { prepared, warnings };
};

const factData = (fact: PreparedFact) => ({
  definitionId: fact.definitionId,
  scope: fact.scope,
  componentName: fact.componentName,
  componentCas: fact.componentCas,
  value: fact.value as object,
  printed: fact.printed,
  unit: fact.unit,
  normalizedValue: fact.normalizedValue,
  normalizedMax: fact.normalizedMax,
  normalizedUnit: fact.normalizedUnit,
  rowIndex: fact.rowIndex,
  pageIndex: fact.pageIndex,
  pageLabel: fact.pageLabel,
  quote: fact.quote,
  method: fact.method,
  confidence: fact.confidence,
  needsHumanCheck: fact.needsHumanCheck,
});

const factWithKey = {
  id: true,
  scope: true,
  componentName: true,
  componentCas: true,
  value: true,
  normalizedValue: true,
  pageIndex: true,
  quote: true,
  method: true,
  state: true,
  verifiedById: true,
  verifiedAt: true,
  replacesFactId: true,
  definition: { select: { key: true, safetyRelevant: true } },
} as const;

// reviewState and the methods summary follow the facts; recomputed after every change.
export const refreshExtractionSummary = async (db: Db, extractionId: string) => {
  const facts = await db.extractedFact.findMany({
    where: { extractionId },
    select: { state: true, method: true, verifiedAt: true, definition: { select: { safetyRelevant: true } } },
  });
  const reviewState = computeReviewState(facts.map((f) => ({ ...f, safetyRelevant: f.definition.safetyRelevant })));
  const methods = Array.from(new Set(facts.filter((f) => f.state === "active" && f.method !== "human").map((f) => f.method))).sort();
  await db.documentExtraction.update({ where: { id: extractionId }, data: { reviewState, methods } });
  return { reviewState, methods };
};

// The documents filed with this content, and the required keys their types call for.
export const contentDocuments = async (db: Db, sha256: string) =>
  db.itemFile.findMany({
    where: { file: { sha256 } },
    select: {
      id: true,
      supersededAt: true,
      fileTypeId: true,
      fileType: { select: { name: true, abbreviaton: true } },
      item: { select: { id: true, name: true, referenceCode: true } },
    },
    orderBy: { createdAt: "asc" },
  });

export const completenessFor = async (db: Db, fileTypeIds: string[], facts: { key: string; state: string }[]) => {
  const required = await requiredKeysFor(db, Array.from(new Set(fileTypeIds)));
  return { missingRequired: missingRequiredKeys(Array.from(required.values()).flat(), facts) };
};

export type StoreExtractionInput = {
  sha256: string;
  extractor: { name: string; version?: string; model?: string };
  pageCount?: number;
  language?: string;
  fullText?: string;
  facts: FactInput[];
  notes?: string;
  supersedeExisting?: boolean;
};

export const storeExtraction = async (db: Db, actor: ExtractionActor, input: StoreExtractionInput) => {
  await lockContent(db, input.sha256);
  const { prepared, warnings } = await prepareAll(db, input.facts);

  const existing = await db.documentExtraction.findFirst({
    where: { sha256: input.sha256, status: { in: ["current", "failed"] } },
    select: { id: true, status: true, facts: { select: factWithKey } },
  });
  if (existing?.status === "current" && !input.supersedeExisting) {
    throw new ExtractionRefused(
      `This content already has a current extraction (${existing.id}). Read it with get_document_extraction; to replace it, pass supersedeExisting: true.`,
      { extractionId: existing.id },
    );
  }

  const extraction = await db.documentExtraction.create({
    data: {
      sha256: input.sha256,
      extractorName: input.extractor.name,
      extractorVersion: input.extractor.version ?? null,
      extractorModel: input.extractor.model ?? null,
      language: input.language ?? null,
      pageCount: input.pageCount ?? null,
      notes: input.notes?.trim() || null,
      createdById: actor.userId,
      apiKeyId: actor.apiKeyId ?? null,
      onBehalfOfId: actor.onBehalfOfId ?? null,
      ...(input.fullText?.trim() && { text: { create: { fullText: input.fullText } } }),
    },
    select: { id: true },
  });

  const newFacts = prepared.map((fact) => ({ id: randomUUID(), ...fact }));
  await db.extractedFact.createMany({
    data: newFacts.map((fact) => ({ id: fact.id, extractionId: extraction.id, createdById: actor.userId, ...factData(fact) })),
  });

  let conflicts: ExtractionConflict[] = [];
  let carried = 0;
  if (existing) {
    await db.documentExtraction.update({ where: { id: existing.id }, data: { status: "superseded", supersededById: extraction.id } });
    await db.documentExtractionEvent.create({
      data: {
        extractionId: existing.id,
        type: existing.status === "failed" ? "failure_cleared" : "superseded",
        actorId: actor.userId,
        apiKeyId: actor.apiKeyId ?? null,
        onBehalfOfId: actor.onBehalfOfId ?? null,
        payload: { supersededBy: extraction.id },
      },
    });

    if (existing.status === "current") {
      const asMatch = (f: (typeof existing.facts)[number]) => ({ ...f, key: f.definition.key });
      const previousVerified = existing.facts.filter((f) => f.state === "active" && f.method !== "human" && f.verifiedAt).map(asMatch);
      const matchable = newFacts.map((f) => ({ ...f, id: f.id }));
      const outcome = carryVerification(previousVerified, matchable);
      conflicts = outcome.conflicts;
      for (const [factId, old] of Array.from(outcome.inherits.entries())) {
        await db.extractedFact.update({ where: { id: factId }, data: { verifiedById: old.verifiedById, verifiedAt: old.verifiedAt, needsHumanCheck: false } });
      }
      carried = outcome.inherits.size;

      // people's own facts always carry forward, overriding the matching new agent fact if there is one
      const overriddenIds = new Set<string>();
      for (const human of existing.facts.filter((f) => f.method === "human" && f.state === "active")) {
        const target = existing.facts.find((f) => f.id === human.replacesFactId);
        const newTarget = target
          ? newFacts.find((f) => !overriddenIds.has(f.id) && factIdentity(f) === factIdentity({ ...target, key: target.definition.key }))
          : undefined;
        if (newTarget) {
          overriddenIds.add(newTarget.id);
          await db.extractedFact.update({ where: { id: newTarget.id }, data: { state: "overridden" } });
        }
        const copy = await db.extractedFact.findUniqueOrThrow({ where: { id: human.id } });
        await db.extractedFact.create({
          data: {
            ...copy,
            id: undefined,
            extractionId: extraction.id,
            replacesFactId: newTarget?.id ?? null,
            value: copy.value as object,
            createdAt: undefined,
            updatedAt: undefined,
          },
        });
      }
    }
  }

  if (conflicts.length) await db.documentExtraction.update({ where: { id: extraction.id }, data: { conflicts: conflicts as object[] } });
  const summary = await refreshExtractionSummary(db, extraction.id);
  await db.documentExtractionEvent.create({
    data: {
      extractionId: extraction.id,
      type: "stored",
      actorId: actor.userId,
      apiKeyId: actor.apiKeyId ?? null,
      onBehalfOfId: actor.onBehalfOfId ?? null,
      payload: {
        facts: newFacts.length,
        ...(existing && { replaced: existing.id }),
        ...(carried && { verificationsCarried: carried }),
        ...(conflicts.length && { conflicts: conflicts.length }),
      },
    },
  });

  const documents = await contentDocuments(db, input.sha256);
  const completeness = await completenessFor(
    db,
    documents.filter((d) => !d.supersededAt).map((d) => d.fileTypeId),
    newFacts.map((f) => ({ key: f.key, state: "active" })),
  );

  return {
    extraction: {
      id: extraction.id,
      sha256: input.sha256,
      status: "current" as const,
      ...summary,
      facts: newFacts.length,
      needsHumanCheck: newFacts.filter((f) => f.needsHumanCheck).length,
    },
    ...(existing && { replaced: { id: existing.id, status: existing.status } }),
    verificationsCarried: carried,
    conflicts,
    completeness,
    warnings,
    factIds: newFacts.map((f) => ({ id: f.id, key: f.key, ...(f.rowIndex !== null && { rowIndex: f.rowIndex }) })),
  };
};

export type UpdateFactsInput = {
  extractionId: string;
  upsert: (FactInput & { factId?: string })[];
  remove: string[];
  reason: string;
};

export const updateExtractionFacts = async (db: Db, actor: ExtractionActor, input: UpdateFactsInput) => {
  const extraction = await db.documentExtraction.findUnique({ where: { id: input.extractionId }, select: { id: true, sha256: true, status: true } });
  if (!extraction) throw new ExtractionRefused(`No extraction ${input.extractionId}.`);
  await lockContent(db, extraction.sha256);
  const current = await db.documentExtraction.findUniqueOrThrow({ where: { id: extraction.id }, select: { status: true, facts: { select: factWithKey } } });
  if (current.status !== "current") throw new ExtractionRefused(`Extraction ${extraction.id} is ${current.status}; only the current extraction can be corrected.`);

  const facts = new Map(current.facts.map((f) => [f.id, f]));
  const touched = [...input.upsert.flatMap((u) => (u.factId ? [u.factId] : [])), ...input.remove];
  for (const id of touched) {
    const fact = facts.get(id);
    if (!fact) throw new ExtractionRefused(`Fact ${id} isn't part of extraction ${extraction.id}.`);
    if (fact.method === "human") throw new ExtractionRefused(`Fact ${id} was written by a person; agents can't change or remove it.`);
  }
  if (new Set(touched).size !== touched.length) throw new ExtractionRefused("A fact appears more than once in upsert/remove.");

  const { prepared, warnings } = await prepareAll(db, input.upsert);
  const added: string[] = [];
  const updated: string[] = [];
  const reset: { factId: string; key: string; verifiedBy: string | null }[] = [];

  for (let i = 0; i < input.upsert.length; i++) {
    const change = input.upsert[i];
    const fact = prepared[i];
    if (!change.factId) {
      const created = await db.extractedFact.create({ data: { extractionId: extraction.id, createdById: actor.userId, ...factData(fact) }, select: { id: true } });
      added.push(created.id);
      continue;
    }
    const old = facts.get(change.factId)!;
    const changed = factIdentity({ ...old, key: old.definition.key }) !== factIdentity(fact) || old.quote !== fact.quote;
    const resetVerification = !!old.verifiedAt && changed;
    if (resetVerification) reset.push({ factId: old.id, key: old.definition.key, verifiedBy: old.verifiedById });
    await db.extractedFact.update({
      where: { id: old.id },
      data: { ...factData(fact), ...(resetVerification && { verifiedById: null, verifiedAt: null }) },
    });
    updated.push(old.id);
  }

  const removedVerified = input.remove.filter((id) => facts.get(id)?.verifiedAt);
  if (input.remove.length) await db.extractedFact.deleteMany({ where: { id: { in: input.remove } } });

  const base = { extractionId: extraction.id, actorId: actor.userId, apiKeyId: actor.apiKeyId ?? null, onBehalfOfId: actor.onBehalfOfId ?? null, reason: input.reason.trim() };
  await db.documentExtractionEvent.create({
    data: {
      ...base,
      type: "facts_updated",
      payload: {
        added,
        updated,
        removed: input.remove.map((id) => ({ id, key: facts.get(id)!.definition.key, value: facts.get(id)!.value })),
      } as object,
    },
  });
  for (const r of reset) {
    await db.documentExtractionEvent.create({ data: { ...base, type: "verification_reset", factId: r.factId, payload: { key: r.key, verifiedBy: r.verifiedBy } } });
  }

  const summary = await refreshExtractionSummary(db, extraction.id);
  return {
    extraction: { id: extraction.id, ...summary },
    added,
    updated,
    removed: input.remove,
    verificationReset: [...reset.map((r) => r.factId), ...removedVerified],
    warnings,
  };
};

export const markExtractionFailed = async (db: Db, actor: ExtractionActor, input: { sha256: string; reason: string }) => {
  await lockContent(db, input.sha256);
  const existing = await db.documentExtraction.findFirst({ where: { sha256: input.sha256, status: { in: ["current", "failed"] } }, select: { id: true, status: true } });
  if (existing?.status === "current") {
    throw new ExtractionRefused(`This content has a current extraction (${existing.id}); re-extract with supersedeExisting instead of marking it failed.`);
  }
  const extraction = existing
    ? await db.documentExtraction.update({ where: { id: existing.id }, data: { failureReason: input.reason.trim() }, select: { id: true } })
    : await db.documentExtraction.create({
        data: {
          sha256: input.sha256,
          status: "failed",
          failureReason: input.reason.trim(),
          createdById: actor.userId,
          apiKeyId: actor.apiKeyId ?? null,
          onBehalfOfId: actor.onBehalfOfId ?? null,
        },
        select: { id: true },
      });
  await db.documentExtractionEvent.create({
    data: {
      extractionId: extraction.id,
      type: "failed",
      actorId: actor.userId,
      apiKeyId: actor.apiKeyId ?? null,
      onBehalfOfId: actor.onBehalfOfId ?? null,
      reason: input.reason.trim(),
    },
  });
  return { extraction: { id: extraction.id, sha256: input.sha256, status: "failed" as const, failureReason: input.reason.trim() }, alreadyFailed: !!existing };
};
