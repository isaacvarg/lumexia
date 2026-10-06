import { DateTime } from "luxon";
import {
  DocumentRecord,
  DocumentStatus,
  EvaluatedDocument,
  EvaluatedLot,
  EvaluatedRequirement,
  LotRecord,
  Requirement,
  RequirementStatus,
  RequirementSubject,
} from "./types";

// Lower is better. Used both to pick the best document for a requirement and the worst lot across lots.
const statusRank: Record<RequirementStatus, number> = {
  notApplicable: 0,
  current: 1,
  expiring: 2,
  undated: 3,
  stale: 4,
  expired: 5,
  missing: 6,
};

const specificity = (r: Requirement) => (r.itemTypeId ? 2 : 0) + (r.procurementTypeId ? 1 : 0);

// For each file type + issuer, the most specific matching rule wins; excluded rules then drop out.
export const resolveRequirements = (rules: Requirement[], subject: RequirementSubject): Requirement[] => {
  const winners = new Map<string, Requirement>();
  for (const rule of rules) {
    if (!rule.itemTypeId && !rule.procurementTypeId) continue;
    if (rule.itemTypeId && rule.itemTypeId !== subject.itemTypeId) continue;
    if (rule.procurementTypeId && rule.procurementTypeId !== subject.procurementTypeId) continue;

    const key = `${rule.fileTypeId}:${rule.issuer}`;
    const current = winners.get(key);
    if (
      !current ||
      specificity(rule) > specificity(current) ||
      (specificity(rule) === specificity(current) && rule.createdAt < current.createdAt)
    ) {
      winners.set(key, rule);
    }
  }
  return Array.from(winners.values()).filter((r) => r.level !== "excluded");
};

export const effectiveExpiry = (doc: DocumentRecord, requirement: Requirement): Date | null => {
  if (doc.expiresAt) return doc.expiresAt;
  if (doc.issuedAt && requirement.validForMonths != null) {
    return DateTime.fromJSDate(doc.issuedAt).plus({ months: requirement.validForMonths }).toJSDate();
  }
  return null;
};

export const evaluateDocument = (doc: DocumentRecord, requirement: Requirement, now: Date): EvaluatedDocument => {
  const expiresAt = effectiveExpiry(doc, requirement);
  const result = (status: DocumentStatus): EvaluatedDocument => ({
    documentId: doc.id,
    status,
    effectiveExpiresAt: expiresAt,
  });

  if (requirement.minIssuedAt && doc.issuedAt && doc.issuedAt < requirement.minIssuedAt) return result("expired");
  if (expiresAt && expiresAt <= now) return result("expired");
  if (doc.issuer === "internal" && doc.derivedFrom?.supersededAt) return result("stale");

  const hasValidityRule = requirement.validForMonths != null || requirement.minIssuedAt != null;
  if (!expiresAt && hasValidityRule && !doc.issuedAt) return result("undated");

  if (expiresAt && DateTime.fromJSDate(expiresAt).minus({ days: requirement.warnDays }).toJSDate() <= now) {
    return result("expiring");
  }
  return result("current");
};

const issuerMatches = (doc: DocumentRecord, requirement: Requirement) =>
  requirement.issuer === "any" || doc.issuer === requirement.issuer;

const evaluateDocuments = (docs: DocumentRecord[], requirement: Requirement, now: Date) =>
  docs
    .map((d) => evaluateDocument(d, requirement, now))
    .sort((a, b) => statusRank[a.status] - statusRank[b.status]);

// Leftover float error from summing transactions shouldn't count as stock.
const ON_HAND_EPSILON = 1e-6;

// Supplier documents belong to received lots, internal ones to lots we produced. Lots created after the
// requirement always count; older lots only while they still have stock, so history doesn't flood the list.
const lotCounts = (lot: LotRecord, requirement: Requirement) => {
  const originMatches =
    (lot.originType === "purchaseOrderReceiving" && requirement.issuer !== "internal") ||
    (lot.originType === "batchProduction" && requirement.issuer !== "supplier");
  if (!originMatches) return false;
  return lot.createdAt >= requirement.createdAt || lot.onHand > ON_HAND_EPSILON;
};

export const evaluateRequirement = (
  requirement: Requirement,
  docs: DocumentRecord[],
  lots: LotRecord[],
  now: Date
): EvaluatedRequirement => {
  const candidates = docs.filter(
    (d) => !d.supersededAt && d.fileTypeId === requirement.fileTypeId && issuerMatches(d, requirement)
  );

  if (requirement.scope !== "lot") {
    const documents = evaluateDocuments(candidates, requirement, now);
    return { requirement, status: documents[0]?.status ?? "missing", documents, lots: null };
  }

  const evaluatedLots: EvaluatedLot[] = lots.map((lot) => {
    const documents = evaluateDocuments(
      candidates.filter((d) => d.lotId === lot.id),
      requirement,
      now
    );
    return {
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      counted: lotCounts(lot, requirement),
      status: documents[0]?.status ?? "missing",
      documents,
    };
  });

  const status = evaluatedLots
    .filter((l) => l.counted)
    .reduce<RequirementStatus>(
      (worst, l) => (statusRank[l.status] > statusRank[worst] ? l.status : worst),
      "notApplicable"
    );

  return { requirement, status, documents: [], lots: evaluatedLots };
};

export const evaluateItemDocuments = (
  rules: Requirement[],
  subject: RequirementSubject,
  docs: DocumentRecord[],
  lots: LotRecord[],
  now: Date = new Date()
): EvaluatedRequirement[] =>
  resolveRequirements(rules, subject).map((r) => evaluateRequirement(r, docs, lots, now));
