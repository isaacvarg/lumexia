import type { Db } from "@/lib/canon/db";
import { ExtractionRefused, refreshExtractionSummary } from "./store";
import { prepareFact } from "./validate";
import { valueSchemaProblems } from "./keys";
import type { FactDefinitionShape, FactKind, FactScope, ValueSchema } from "./types";

// What only people do, from the UI: verify facts, override what the agent read, clear failures, and look
// after the fact catalog. Every change is logged. None of this is reachable over MCP.

const event = (db: Db, data: { type: string; actorId: string; extractionId?: string; factId?: string; factDefinitionId?: string; reason?: string | null; payload?: object }) =>
  db.documentExtractionEvent.create({ data: { ...data, reason: data.reason?.trim() || null } });

const loadFact = async (db: Db, factId: string) => {
  const fact = await db.extractedFact.findUnique({
    where: { id: factId },
    include: { extraction: { select: { id: true, status: true } }, definition: true },
  });
  if (!fact) throw new ExtractionRefused("That fact no longer exists.");
  if (fact.extraction.status !== "current") throw new ExtractionRefused("Only facts of the current extraction can be changed.");
  return fact;
};

export const verifyFact = async (db: Db, userId: string, factId: string) => {
  const fact = await loadFact(db, factId);
  if (fact.state !== "active") throw new ExtractionRefused("This fact was overridden; check the override instead.");
  if (fact.method === "human") throw new ExtractionRefused("Facts people entered are already verified.");
  if (fact.verifiedAt) return fact;
  await db.extractedFact.update({ where: { id: factId }, data: { verifiedById: userId, verifiedAt: new Date() } });
  await event(db, { type: "verified", actorId: userId, extractionId: fact.extractionId, factId, payload: { key: fact.definition.key } });
  return refreshExtractionSummary(db, fact.extractionId);
};

export const unverifyFact = async (db: Db, userId: string, factId: string) => {
  const fact = await loadFact(db, factId);
  if (fact.method === "human") throw new ExtractionRefused("To undo an override, revert it.");
  if (!fact.verifiedAt) return refreshExtractionSummary(db, fact.extractionId);
  await db.extractedFact.update({ where: { id: factId }, data: { verifiedById: null, verifiedAt: null } });
  await event(db, { type: "unverified", actorId: userId, extractionId: fact.extractionId, factId, payload: { key: fact.definition.key, previouslyVerifiedBy: fact.verifiedById } });
  return refreshExtractionSummary(db, fact.extractionId);
};

export type OverrideInput = { value: unknown; printed?: string; unit?: string; quote?: string; reason: string };

// A person's correction: the agent's fact is kept but overridden, and a verified human fact takes its place.
// Correcting a human fact edits it in place.
export const overrideFact = async (db: Db, userId: string, factId: string, input: OverrideInput) => {
  if (!input.reason?.trim()) throw new ExtractionRefused("Say why you're correcting it.");
  const fact = await loadFact(db, factId);
  if (fact.state !== "active") throw new ExtractionRefused("This fact is already overridden; correct the override instead.");
  const definition: FactDefinitionShape = {
    id: fact.definition.id,
    key: fact.definition.key,
    label: fact.definition.label,
    kind: fact.definition.kind as FactKind,
    valueSchema: fact.definition.valueSchema as ValueSchema,
    unitFamily: fact.definition.unitFamily,
    safetyRelevant: fact.definition.safetyRelevant,
    status: fact.definition.status as FactDefinitionShape["status"],
  };
  // validated as an agent fact would be, then marked as the person's
  const check = prepareFact(definition, {
    key: fact.definition.key,
    scope: fact.scope as FactScope,
    component: fact.scope === "component" ? { name: fact.componentName ?? undefined, cas: fact.componentCas ?? undefined } : undefined,
    value: input.value,
    printed: input.printed,
    unit: input.unit ?? fact.unit ?? undefined,
    rowIndex: fact.rowIndex ?? undefined,
    page: { index: fact.pageIndex ?? undefined, label: fact.pageLabel ?? undefined },
    quote: input.quote?.trim() || fact.quote,
    method: "text_layer",
    confidence: "high",
  });
  if ("errors" in check) throw new ExtractionRefused(check.errors.join("; "));
  const p = check.fact;
  const data = {
    value: p.value as object,
    printed: p.printed,
    unit: p.unit,
    normalizedValue: p.normalizedValue,
    normalizedMax: p.normalizedMax,
    normalizedUnit: p.normalizedUnit,
    quote: p.quote,
    method: "human",
    confidence: "high",
    needsHumanCheck: false,
    verifiedById: userId,
    verifiedAt: new Date(),
  };

  let humanFactId: string;
  if (fact.method === "human") {
    await db.extractedFact.update({ where: { id: fact.id }, data });
    humanFactId = fact.id;
  } else {
    await db.extractedFact.update({ where: { id: fact.id }, data: { state: "overridden" } });
    const created = await db.extractedFact.create({
      data: {
        ...data,
        extractionId: fact.extractionId,
        definitionId: fact.definitionId,
        scope: fact.scope,
        componentName: fact.componentName,
        componentCas: fact.componentCas,
        rowIndex: fact.rowIndex,
        pageIndex: fact.pageIndex,
        pageLabel: fact.pageLabel,
        replacesFactId: fact.id,
        createdById: userId,
      },
      select: { id: true },
    });
    humanFactId = created.id;
  }
  await event(db, {
    type: "overridden",
    actorId: userId,
    extractionId: fact.extractionId,
    factId: humanFactId,
    reason: input.reason,
    payload: { key: fact.definition.key, from: fact.value as object, to: p.value as object, replaces: fact.method === "human" ? null : fact.id },
  });
  return { factId: humanFactId, ...(await refreshExtractionSummary(db, fact.extractionId)) };
};

// Removes a person's correction; the agent's fact it replaced (if any) is active again.
export const revertOverride = async (db: Db, userId: string, humanFactId: string, reason?: string) => {
  const fact = await loadFact(db, humanFactId);
  if (fact.method !== "human") throw new ExtractionRefused("Only a person's correction can be reverted.");
  if (fact.replacesFactId) await db.extractedFact.update({ where: { id: fact.replacesFactId }, data: { state: "active" } });
  await db.extractedFact.delete({ where: { id: fact.id } });
  await event(db, {
    type: "override_reverted",
    actorId: userId,
    extractionId: fact.extractionId,
    factId: fact.replacesFactId ?? fact.id,
    reason,
    payload: { key: fact.definition.key, removedValue: fact.value as object },
  });
  return refreshExtractionSummary(db, fact.extractionId);
};

// After a failure was cleared, the document counts as not extracted, so the agent tries again.
export const clearExtractionFailure = async (db: Db, userId: string, extractionId: string) => {
  const extraction = await db.documentExtraction.findUnique({ where: { id: extractionId }, select: { status: true } });
  if (extraction?.status !== "failed") throw new ExtractionRefused("That extraction isn't marked failed.");
  await db.documentExtraction.update({ where: { id: extractionId }, data: { status: "superseded" } });
  await event(db, { type: "failure_cleared", actorId: userId, extractionId });
};

// The catalog

export type DefinitionEdit = {
  label: string;
  description: string | null;
  safetyRelevant: boolean;
  displayOrder: number;
  // document types the key applies to, and whether each requires it
  fileTypes: { fileTypeId: string; required: boolean }[];
};

export const updateFactDefinition = async (db: Db, userId: string, definitionId: string, edit: DefinitionEdit) => {
  const before = await db.factDefinition.findUnique({ where: { id: definitionId }, include: { fileTypes: true } });
  if (!before) throw new ExtractionRefused("That key no longer exists.");
  if (!edit.label.trim()) throw new ExtractionRefused("A label is required.");
  await db.factDefinition.update({
    where: { id: definitionId },
    data: { label: edit.label.trim(), description: edit.description?.trim() || null, safetyRelevant: edit.safetyRelevant, displayOrder: edit.displayOrder },
  });
  await db.factDefinitionFileType.deleteMany({ where: { factDefinitionId: definitionId } });
  if (edit.fileTypes.length) {
    await db.factDefinitionFileType.createMany({ data: edit.fileTypes.map((t) => ({ factDefinitionId: definitionId, fileTypeId: t.fileTypeId, required: t.required })) });
  }
  await event(db, {
    type: "key_edited",
    actorId: userId,
    factDefinitionId: definitionId,
    payload: {
      key: before.key,
      before: { label: before.label, safetyRelevant: before.safetyRelevant, fileTypes: before.fileTypes.map((t) => ({ fileTypeId: t.fileTypeId, required: t.required })) },
      after: { label: edit.label, safetyRelevant: edit.safetyRelevant, fileTypes: edit.fileTypes },
    },
  });
};

export const setFactDefinitionStatus = async (db: Db, userId: string, definitionId: string, status: "approved" | "deprecated") => {
  const definition = await db.factDefinition.findUnique({ where: { id: definitionId }, select: { key: true, status: true } });
  if (!definition) throw new ExtractionRefused("That key no longer exists.");
  if (definition.status === status) return;
  await db.factDefinition.update({ where: { id: definitionId }, data: { status } });
  await event(db, { type: status === "approved" ? "key_approved" : "key_deprecated", actorId: userId, factDefinitionId: definitionId, payload: { key: definition.key, from: definition.status } });
};

// Moves every fact from one key to another of the same shape; the old key then resolves to the new one.
export const mergeFactDefinition = async (db: Db, userId: string, fromId: string, intoId: string) => {
  if (fromId === intoId) throw new ExtractionRefused("Pick a different key to merge into.");
  const [from, into] = await Promise.all([
    db.factDefinition.findUnique({ where: { id: fromId } }),
    db.factDefinition.findUnique({ where: { id: intoId } }),
  ]);
  if (!from || !into) throw new ExtractionRefused("That key no longer exists.");
  if (into.mergedIntoId || into.status === "deprecated") throw new ExtractionRefused(`${into.key} is deprecated; merge into a current key.`);
  if (from.kind !== into.kind) throw new ExtractionRefused(`${from.key} is a ${from.kind} and ${into.key} a ${into.kind}; only keys of the same kind can merge.`);
  if (from.kind === "row") {
    const target = new Set(((into.valueSchema as ValueSchema).columns ?? []).map((c) => c.name));
    const missing = ((from.valueSchema as ValueSchema).columns ?? []).map((c) => c.name).filter((c) => !target.has(c));
    if (missing.length) throw new ExtractionRefused(`${into.key} has no columns ${missing.join(", ")}; its rows couldn't hold ${from.key}'s values.`);
  }
  if (from.kind === "enum") {
    const options = new Set((into.valueSchema as ValueSchema).options ?? []);
    const values = await db.extractedFact.findMany({ where: { definitionId: fromId }, select: { value: true } });
    const outside = Array.from(new Set(values.map((v) => String(v.value)))).filter((v) => !options.has(v));
    if (outside.length) throw new ExtractionRefused(`${into.key} has no options ${outside.join(", ")}.`);
  }
  if (valueSchemaProblems(into.kind as FactKind, into.valueSchema as ValueSchema, into.unitFamily).length) {
    throw new ExtractionRefused(`${into.key}'s own value schema has problems; fix it first.`);
  }
  const moved = await db.extractedFact.updateMany({ where: { definitionId: fromId }, data: { definitionId: intoId } });
  // Canon data types mapped to the old key now look at the new one
  const mappings = await db.canonDataTypeFactDefinition.findMany({ where: { factDefinitionId: fromId }, select: { dataTypeId: true } });
  await db.canonDataTypeFactDefinition.createMany({ data: mappings.map((m) => ({ dataTypeId: m.dataTypeId, factDefinitionId: intoId })), skipDuplicates: true });
  await db.canonDataTypeFactDefinition.deleteMany({ where: { factDefinitionId: fromId } });
  await db.factDefinition.update({ where: { id: fromId }, data: { mergedIntoId: intoId, status: "deprecated" } });
  // keys merged into `from` earlier now point at the final key
  await db.factDefinition.updateMany({ where: { mergedIntoId: fromId }, data: { mergedIntoId: intoId } });
  await event(db, { type: "key_merged", actorId: userId, factDefinitionId: fromId, payload: { from: from.key, into: into.key, factsMoved: moved.count } });
  return { factsMoved: moved.count };
};
