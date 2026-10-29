import type { Prisma } from "@prisma/client";
import type { Db } from "@/lib/canon/db";
import { qcDataTypes } from "@/configs/staticRecords/qcDataTypes";
import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes";
import { qcRecordStatuses } from "@/configs/staticRecords/qcRecordStatuses";
import { sameSupplierLot } from "@/lib/itemDocuments/supplierLots";
import {
  computeOutcome,
  decideReview,
  effectiveOutcome,
  normalizeTestName,
  parseResultNumber,
  parseSpecification,
  recordVerdict,
  unitsComparable,
  type Outcome,
  type ReviewReason,
} from "./rules";

// Importing a supplier COA into a lot's quality results. Every function takes the transaction runWrite
// gives it, so a dry run goes through exactly the same code and rolls back. Rules live in rules.ts.
//
// - Parameters are matched to existing ones only on an exact normalized name; otherwise created verbatim.
// - isSold items: the first COA seeds the dry specs from its printed limits and a pending baseline. Later
//   lots are checked against the approved baseline.
// - Other items get parameters and informational results only.
// - A result from a replaced document is replaced unless a person touched it (confirmed or edited).

export class CoaImportRefused extends Error {}

export type CoaImportActor = { userId: string; apiKeyId?: string | null };

export type CoaImportSuggestion = {
  factId: string;
  outcome?: Outcome;
  // pick among same-named parameters when the match is ambiguous
  parameterId?: string;
};

export type CoaImportInput = { lotId: string; documentId: string; suggestions?: CoaImportSuggestion[] };

type RowReport = {
  factId: string;
  test: string;
  result: string;
  unit: string | null;
  parameterId: string;
  parameterCreated: boolean;
  specSeeded: boolean;
  computedOutcome: Outcome | null;
  suggestedOutcome: Outcome | null;
  supplierOutcome: Outcome | null;
  reviewState: "accepted" | "needsReview";
  reasons: ReviewReason[];
};

export type CoaImportReport = {
  lotId: string;
  documentId: string;
  qcRecordId: string;
  item: { id: string; isSold: boolean };
  baseline: "none" | "pending" | "approved";
  baselineCreated: boolean;
  recordStatus: "open" | "pass" | "outOfSpecification";
  rows: RowReport[];
  missingTests: string[];
  proposedAdditions: string[];
  supersededImports: number;
  keptEdited: string[];
};

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim());

const outcomeOf = (value: unknown): Outcome | null => {
  const v = asString(value).toLowerCase();
  return v === "pass" || v === "fail" ? v : null;
};

const log = (db: Db, actor: CoaImportActor, qcRecordId: string, entry: { action: string; table: string; recordId: string; field: string; oldValue?: string; newValue: string }) =>
  db.qcAuditLog.create({
    data: {
      qcRecordId,
      editedById: actor.userId,
      action: entry.action,
      editedTableName: entry.table,
      recordId: entry.recordId,
      fieldName: entry.field,
      oldValue: entry.oldValue ?? "",
      newValue: entry.newValue,
    },
  });

// A result a person changed after it was written (confirmed, or edited through the UI).
const touchedByPerson = (r: { confirmedAt: Date | null; createdAt: Date; updatedAt: Date }) =>
  r.confirmedAt !== null || r.updatedAt.getTime() - r.createdAt.getTime() > 2000;

export const importLotCoaResults = async (db: Db, actor: CoaImportActor, input: CoaImportInput): Promise<CoaImportReport> => {
  const lot = await db.lot.findUnique({
    where: { id: input.lotId },
    select: { id: true, lotNumber: true, itemId: true, supplierLotNumber: true, item: { select: { id: true, isSold: true } } },
  });
  if (!lot) throw new CoaImportRefused(`No lot ${input.lotId}. Use get_item_lots.`);

  const document = await db.itemFile.findUnique({
    where: { id: input.documentId },
    select: { id: true, itemId: true, lotId: true, supplierLotNumber: true, supersededAt: true, fileType: { select: { abbreviaton: true } }, file: { select: { sha256: true } } },
  });
  if (!document) throw new CoaImportRefused(`No item document ${input.documentId}. Use get_item_documents.`);
  if (document.fileType.abbreviaton?.toUpperCase() !== "COA") throw new CoaImportRefused("That document isn't a COA.");
  if (document.supersededAt) throw new CoaImportRefused("That COA has been replaced by a newer one; import the newer document.");
  if (document.itemId !== lot.itemId) throw new CoaImportRefused("The COA belongs to a different item than the lot.");

  // The lot must resolve unambiguously: the COA is already filed against it, or both carry the same supplier lot.
  const sameLot =
    document.lotId === lot.id ||
    (!document.lotId && !!document.supplierLotNumber && !!lot.supplierLotNumber && sameSupplierLot(document.supplierLotNumber, lot.supplierLotNumber));
  if (!sameLot) {
    throw new CoaImportRefused(
      `The COA's supplier lot (${document.supplierLotNumber ?? "none"}) doesn't match lot ${lot.lotNumber} (supplier lot ${lot.supplierLotNumber ?? "none"}). ` +
        "Nothing was imported; the facts stay as they are until the lot matches.",
    );
  }

  if (!document.file.sha256) throw new CoaImportRefused("The document's file has no hash yet; store its extraction first.");
  const extraction = await db.documentExtraction.findFirst({
    where: { sha256: document.file.sha256, status: "current" },
    select: { id: true },
  });
  if (!extraction) throw new CoaImportRefused("This COA has no current extraction. Store one with store_document_extraction first.");

  const facts = await db.extractedFact.findMany({
    where: { extractionId: extraction.id, state: "active", definition: { key: "test_result" } },
    orderBy: [{ rowIndex: "asc" }, { createdAt: "asc" }],
  });
  if (!facts.length) throw new CoaImportRefused("The extraction has no test_result facts to import.");
  const suggestions = new Map((input.suggestions ?? []).map((s) => [s.factId, s]));
  for (const id of Array.from(suggestions.keys())) {
    if (!facts.some((f) => f.id === id)) throw new CoaImportRefused(`suggestions: ${id} isn't a test_result fact of this COA.`);
  }

  // earlier imports for this lot (this document or one it replaced): drop what nobody touched, keep the rest
  const keptEdited: string[] = [];
  const earlier = await db.qcCoaImport.findMany({ where: { lotId: lot.id, supersededAt: null }, select: { id: true, itemFileId: true } });
  const earlierFileIds = earlier.map((e) => e.itemFileId);
  const oldResults = earlierFileIds.length
    ? await db.qcParameterResult.findMany({ where: { source: "supplierCoa", sourceItemFileId: { in: earlierFileIds }, qcRecord: { examinedLotId: lot.id } }, include: { qcItemParameter: { select: { parameter: { select: { name: true } } } } } })
    : [];

  let record = await db.qcRecord.findFirst({ where: { examinedLotId: lot.id, examinationTypeId: qcExaminationTypes.dry }, select: { id: true, statusId: true } });
  if (!record) {
    record = await db.qcRecord.create({
      data: { conductedById: actor.userId, statusId: qcRecordStatuses.open, examinationTypeId: qcExaminationTypes.dry, examinedLotId: lot.id, sourceItemFileId: document.id },
      select: { id: true, statusId: true },
    });
    await log(db, actor, record.id, { action: "create", table: "qc_records", recordId: record.id, field: "sourceItemFileId", newValue: document.id });
  }

  for (const old of oldResults) {
    if (touchedByPerson(old)) {
      keptEdited.push(old.qcItemParameter.parameter.name);
      continue;
    }
    await db.qcParameterResult.delete({ where: { id: old.id } });
    await log(db, actor, record.id, { action: "delete", table: "qc_parameter_results", recordId: old.id, field: "value", oldValue: old.value, newValue: "" });
  }
  if (earlier.length) await db.qcCoaImport.updateMany({ where: { id: { in: earlier.map((e) => e.id) } }, data: { supersededAt: new Date() } });

  // item state: baseline, and which tests the item already has dry specs for
  const baselineRow = await db.qcItemBaseline.findUnique({ where: { itemId: lot.itemId } });
  const seedsBaseline = lot.item.isSold && !baselineRow;
  const baselineApproved = lot.item.isSold && baselineRow?.status === "approved";
  if (seedsBaseline) {
    await db.qcItemBaseline.create({ data: { itemId: lot.itemId, status: "pending", sourceItemFileId: document.id } });
  }

  const itemParameters = await db.qcItemParameter.findMany({
    where: { itemId: lot.itemId },
    include: { parameter: true, specifications: { where: { examinationTypeId: qcExaminationTypes.dry } } },
  });
  const byName = new Map<string, typeof itemParameters>();
  for (const ip of itemParameters) {
    const key = normalizeTestName(ip.parameter.name);
    byName.set(key, [...(byName.get(key) ?? []), ip]);
  }
  const runCounts = new Map<string, number>();
  const rows: RowReport[] = [];
  const outcomes: (Outcome | null)[] = [];
  const seenParameterIds = new Set<string>();
  const proposedAdditions: string[] = [];

  for (const fact of facts) {
    const value = (fact.value ?? {}) as Record<string, unknown>;
    const test = asString(value.test);
    const result = asString(value.result);
    const unit = asString(value.unit) || fact.unit || null;
    if (!test || !result) throw new CoaImportRefused(`Fact ${fact.id} is missing its test name or result; correct it with update_extraction_facts.`);
    const suggestion = suggestions.get(fact.id);

    // 1. the item's own parameter with this name, 2. any parameter with this name (attached to the item), 3. a new one
    let parameterCreated = false;
    let itemParameter = suggestion?.parameterId ? itemParameters.find((ip) => ip.parameterId === suggestion.parameterId) : undefined;
    const candidates = byName.get(normalizeTestName(test)) ?? [];
    if (!itemParameter && candidates.length > 1) {
      throw new CoaImportRefused(`"${test}" matches ${candidates.length} parameters on this item. Pass suggestions[].parameterId for fact ${fact.id}.`);
    }
    itemParameter ??= candidates[0];
    if (!itemParameter) {
      let parameter = suggestion?.parameterId
        ? await db.qcParameter.findUnique({ where: { id: suggestion.parameterId } })
        : (await db.qcParameter.findMany({ select: { id: true, name: true, uom: true, dataTypeId: true, description: true, isWetParameter: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "asc" } })).find(
            (p) => normalizeTestName(p.name) === normalizeTestName(test),
          );
      if (!parameter) {
        parameter = await db.qcParameter.create({
          data: { name: test, uom: unit ?? "", dataTypeId: parseResultNumber(result) !== null ? qcDataTypes.number : qcDataTypes.text, isWetParameter: false },
        });
        parameterCreated = true;
        await log(db, actor, record.id, { action: "create", table: "qc_parameters", recordId: parameter.id, field: "name", newValue: test });
      }
      const created = await db.qcItemParameter.create({ data: { itemId: lot.itemId, parameterId: parameter.id }, include: { parameter: true, specifications: { where: { examinationTypeId: qcExaminationTypes.dry } } } });
      itemParameter = created;
      itemParameters.push(created);
      byName.set(normalizeTestName(test), [created]);
    }

    // the dry spec: seeded from the printed limits on the item's first COA, never invented later
    let spec = itemParameter.specifications[0] ?? null;
    let specSeeded = false;
    if (!spec && seedsBaseline) {
      const parsed = parseSpecification(asString(value.specification));
      if (parsed) {
        spec = await db.qcItemSpecification.create({
          data: {
            itemParameterId: itemParameter.id,
            examinationTypeId: qcExaminationTypes.dry,
            name: "Supplier COA",
            valueA: parsed.valueA,
            valueB: parsed.valueB,
            specificationType: parsed.type,
            displayOnCoa: false,
            createdById: actor.userId,
            sourceItemFileId: document.id,
          },
        });
        itemParameter.specifications.push(spec);
        specSeeded = true;
        await log(db, actor, record.id, { action: "create", table: "qc_item_specifications", recordId: spec.id, field: "valueA", newValue: `${parsed.type} ${parsed.valueA}${parsed.valueB ? `-${parsed.valueB}` : ""}` });
      }
    }

    const mismatch = !unitsComparable(unit, itemParameter.parameter.uom);
    const outcomeSet = {
      computed: baselineApproved && !mismatch ? computeOutcome(spec, result) : null,
      suggested: suggestion?.outcome ?? null,
      supplier: outcomeOf(value.outcome),
    };
    // a test the baseline COA already reported (even one with no printable limit) isn't an addition
    const extraTest = baselineApproved && !spec && !parameterCreated && !!baselineRow && itemParameter.createdAt > baselineRow.createdAt;
    if (extraTest) proposedAdditions.push(test);
    const review = decideReview({
      confidence: fact.confidence,
      needsHumanCheck: fact.needsHumanCheck,
      newParameter: parameterCreated,
      outcomes: outcomeSet,
      unitMismatch: mismatch && !!spec,
      extraTest,
    });

    seenParameterIds.add(itemParameter.id);
    const run = (runCounts.get(itemParameter.id) ?? 0) + 1;
    runCounts.set(itemParameter.id, run);
    const data: Prisma.QcParameterResultUncheckedCreateInput = {
      qcRecordId: record.id,
      qcItemParameterId: itemParameter.id,
      value: result,
      runNumber: run,
      reviewState: review.reviewState,
      reviewReasons: review.reasons,
      source: "supplierCoa",
      sourceItemFileId: document.id,
      sourceFactId: fact.id,
      computedOutcome: outcomeSet.computed,
      suggestedOutcome: outcomeSet.suggested,
      supplierOutcome: outcomeSet.supplier,
    };
    // a kept (person-edited) result owns this slot; the COA's value goes unwritten and is reported
    const kept = await db.qcParameterResult.findUnique({ where: { qcRecordId_qcItemParameterId_runNumber: { qcRecordId: record.id, qcItemParameterId: itemParameter.id, runNumber: run } } });
    if (kept) {
      if (!keptEdited.includes(test)) keptEdited.push(test);
    } else {
      const saved = await db.qcParameterResult.create({ data });
      await log(db, actor, record.id, { action: "create", table: "qc_parameter_results", recordId: saved.id, field: "value", newValue: result });
    }

    outcomes.push(lot.item.isSold && baselineApproved && spec ? effectiveOutcome(outcomeSet) : null);
    rows.push({
      factId: fact.id,
      test,
      result,
      unit,
      parameterId: itemParameter.parameterId,
      parameterCreated,
      specSeeded,
      computedOutcome: outcomeSet.computed,
      suggestedOutcome: outcomeSet.suggested,
      supplierOutcome: outcomeSet.supplier,
      reviewState: review.reviewState,
      reasons: review.reasons,
    });
  }

  // baseline tests this COA doesn't report
  const missingTests = baselineApproved ? itemParameters.filter((ip) => ip.specifications.length && !seenParameterIds.has(ip.id)).map((ip) => ip.parameter.name) : [];

  const verdict = lot.item.isSold ? recordVerdict({ baselineApproved, outcomes, missingTests: missingTests.length }) : null;
  const recordStatus = verdict ?? "open";
  const statusId = verdict ? qcRecordStatuses[verdict] : qcRecordStatuses.open;
  await db.qcRecord.update({ where: { id: record.id }, data: { statusId, sourceItemFileId: document.id } });
  if (record.statusId !== statusId) await log(db, actor, record.id, { action: "update", table: "qc_records", recordId: record.id, field: "statusId", oldValue: record.statusId, newValue: statusId });

  const report: CoaImportReport = {
    lotId: lot.id,
    documentId: document.id,
    qcRecordId: record.id,
    item: lot.item,
    baseline: !lot.item.isSold ? "none" : baselineApproved ? "approved" : "pending",
    baselineCreated: seedsBaseline,
    recordStatus,
    rows,
    missingTests,
    proposedAdditions,
    supersededImports: earlier.length,
    keptEdited,
  };
  await db.qcCoaImport.upsert({
    where: { lotId_itemFileId: { lotId: lot.id, itemFileId: document.id } },
    create: { lotId: lot.id, itemFileId: document.id, qcRecordId: record.id, createdById: actor.userId, report: report as unknown as Prisma.InputJsonValue },
    update: { qcRecordId: record.id, createdById: actor.userId, supersededAt: null, report: report as unknown as Prisma.InputJsonValue },
  });
  return report;
};

// Takes back an import: results nobody touched are deleted, edited or confirmed ones stay. Parameters and
// specs the import created are left for people to tidy, since other lots may already rely on them.
export const undoCoaImport = async (db: Db, actor: CoaImportActor, input: { lotId: string; documentId: string }) => {
  const existing = await db.qcCoaImport.findUnique({ where: { lotId_itemFileId: { lotId: input.lotId, itemFileId: input.documentId } } });
  if (!existing || existing.supersededAt) throw new CoaImportRefused("There is no active import of that COA for this lot.");
  const results = await db.qcParameterResult.findMany({ where: { source: "supplierCoa", sourceItemFileId: input.documentId, qcRecord: { examinedLotId: input.lotId } } });
  let removed = 0;
  const kept: string[] = [];
  for (const r of results) {
    if (touchedByPerson(r)) {
      kept.push(r.id);
      continue;
    }
    await db.qcParameterResult.delete({ where: { id: r.id } });
    if (existing.qcRecordId) await log(db, actor, existing.qcRecordId, { action: "delete", table: "qc_parameter_results", recordId: r.id, field: "value", oldValue: r.value, newValue: "" });
    removed++;
  }
  if (existing.qcRecordId) {
    await db.qcRecord.update({ where: { id: existing.qcRecordId }, data: { statusId: qcRecordStatuses.open } });
  }
  await db.qcCoaImport.update({ where: { id: existing.id }, data: { supersededAt: new Date() } });
  return { removed, keptEditedResultIds: kept };
};

// What only people do, from the UI (never over MCP): approve an item's baseline, confirm or reject an
// imported result. Every change is logged.

// Approving makes later lots (and this item's earlier imports) count against the baseline: earlier imports are
// run again so their results get computed outcomes and their records a verdict. Hermes's suggestions carry over.
export const approveBaseline = async (db: Db, actor: CoaImportActor, itemId: string) => {
  const baseline = await db.qcItemBaseline.findUnique({ where: { itemId } });
  if (!baseline) throw new CoaImportRefused("This item has no baseline to approve.");
  if (baseline.status === "approved") return { rechecked: 0 };
  await db.qcItemBaseline.update({ where: { itemId }, data: { status: "approved", approvedById: actor.userId, approvedAt: new Date() } });

  const imports = await db.qcCoaImport.findMany({ where: { supersededAt: null, lot: { itemId } }, select: { lotId: true, itemFileId: true, qcRecordId: true } });
  for (const imp of imports) {
    if (imp.qcRecordId) await log(db, actor, imp.qcRecordId, { action: "update", table: "qc_item_baselines", recordId: baseline.id, field: "status", oldValue: "pending", newValue: "approved" });
    const suggested = await db.qcParameterResult.findMany({ where: { source: "supplierCoa", sourceItemFileId: imp.itemFileId, suggestedOutcome: { not: null }, qcRecord: { examinedLotId: imp.lotId } }, select: { sourceFactId: true, suggestedOutcome: true } });
    await importLotCoaResults(db, actor, {
      lotId: imp.lotId,
      documentId: imp.itemFileId,
      suggestions: suggested.flatMap((r) => (r.sourceFactId ? [{ factId: r.sourceFactId, outcome: r.suggestedOutcome as Outcome }] : [])),
    });
  }
  return { rechecked: imports.length };
};

const loadReviewResult = async (db: Db, resultId: string) => {
  const result = await db.qcParameterResult.findUnique({ where: { id: resultId } });
  if (!result || result.source !== "supplierCoa") throw new CoaImportRefused("That result no longer exists.");
  return result;
};

export const confirmResult = async (db: Db, actor: CoaImportActor, resultId: string) => {
  const result = await loadReviewResult(db, resultId);
  if (result.reviewState === "accepted") return;
  await db.qcParameterResult.update({ where: { id: resultId }, data: { reviewState: "accepted", confirmedById: actor.userId, confirmedAt: new Date() } });
  await log(db, actor, result.qcRecordId, { action: "update", table: "qc_parameter_results", recordId: resultId, field: "reviewState", oldValue: result.reviewState, newValue: "accepted" });
};

// The reading is wrong: the result goes, and importing the COA again would bring it back from the facts.
export const rejectResult = async (db: Db, actor: CoaImportActor, resultId: string) => {
  const result = await loadReviewResult(db, resultId);
  await db.qcParameterResult.delete({ where: { id: resultId } });
  await log(db, actor, result.qcRecordId, { action: "delete", table: "qc_parameter_results", recordId: resultId, field: "value", oldValue: result.value, newValue: "" });
};
