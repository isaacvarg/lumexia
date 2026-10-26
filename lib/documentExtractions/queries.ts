import { Prisma } from "@prisma/client";
import type { Db } from "@/lib/canon/db";
import { completenessFor, contentDocuments } from "./store";
import { hashFiles } from "./content";
import { toCanonical } from "./units";
import type { DocumentExtractionStatus } from "./types";

// Reading extractions. fullText is only loaded when asked for by name; lists and searches never carry it.

const factSelect = {
  id: true,
  scope: true,
  componentName: true,
  componentCas: true,
  value: true,
  printed: true,
  unit: true,
  normalizedValue: true,
  normalizedMax: true,
  normalizedUnit: true,
  rowIndex: true,
  pageIndex: true,
  pageLabel: true,
  quote: true,
  method: true,
  confidence: true,
  needsHumanCheck: true,
  state: true,
  replacesFactId: true,
  verifiedAt: true,
  verifiedBy: { select: { id: true, name: true } },
  definition: { select: { key: true, label: true, kind: true, displayOrder: true, safetyRelevant: true, status: true } },
} as const;

type FactRow = Prisma.ExtractedFactGetPayload<{ select: typeof factSelect }>;

const day = (d: Date | null) => (d ? d.toISOString() : null);

export const describeFact = (f: FactRow) => ({
  id: f.id,
  key: f.definition.key,
  label: f.definition.label,
  ...(f.definition.status !== "approved" && { keyStatus: f.definition.status }),
  scope: f.scope,
  ...(f.scope === "component" && { component: { name: f.componentName, cas: f.componentCas } }),
  value: f.value,
  printed: f.printed,
  ...(f.unit && { unit: f.unit }),
  ...(f.normalizedValue !== null && {
    normalized: { min: f.normalizedValue, max: f.normalizedMax, unit: f.normalizedUnit },
  }),
  ...(f.rowIndex !== null && { rowIndex: f.rowIndex }),
  page: { index: f.pageIndex, label: f.pageLabel },
  quote: f.quote,
  method: f.method,
  confidence: f.confidence,
  safetyRelevant: f.definition.safetyRelevant,
  needsHumanCheck: f.needsHumanCheck,
  ...(f.state !== "active" && { state: f.state }),
  ...(f.replacesFactId && { replacesFactId: f.replacesFactId }),
  verified: f.verifiedAt ? { by: f.verifiedBy?.name ?? null, at: day(f.verifiedAt) } : null,
});

const sortFacts = (facts: FactRow[]) =>
  [...facts].sort(
    (a, b) =>
      a.definition.displayOrder - b.definition.displayOrder ||
      a.definition.key.localeCompare(b.definition.key) ||
      (a.rowIndex ?? 0) - (b.rowIndex ?? 0),
  );

const describeDocument = (d: Awaited<ReturnType<typeof contentDocuments>>[number]) => ({
  documentId: d.id,
  item: d.item,
  type: d.fileType.abbreviaton ? `${d.fileType.abbreviaton} (${d.fileType.name})` : d.fileType.name,
  replaced: !!d.supersededAt,
});

// The current (or failed) extraction of some content, with its facts, the documents filed with it, and
// what its document types still require.
export const getExtraction = async (db: Db, sha256: string, options: { includeFullText?: boolean; includeHistory?: boolean } = {}) => {
  const extraction = await db.documentExtraction.findFirst({
    where: { sha256, status: { in: ["current", "failed"] } },
    select: {
      id: true,
      sha256: true,
      status: true,
      extractorName: true,
      extractorVersion: true,
      extractorModel: true,
      methods: true,
      language: true,
      pageCount: true,
      notes: true,
      failureReason: true,
      reviewState: true,
      conflicts: true,
      createdAt: true,
      updatedAt: true,
      createdBy: { select: { id: true, name: true } },
      facts: { select: factSelect },
      ...(options.includeFullText && { text: { select: { fullText: true } } }),
    },
  });
  const documents = await contentDocuments(db, sha256);
  const previous = await db.documentExtraction.count({ where: { sha256, status: "superseded" } });
  if (!extraction) return { exists: false as const, sha256, previousExtractions: previous, documents: documents.map(describeDocument) };

  const facts = sortFacts(extraction.facts);
  const completeness = await completenessFor(
    db,
    documents.filter((d) => !d.supersededAt).map((d) => d.fileTypeId),
    facts.map((f) => ({ key: f.definition.key, state: f.state })),
  );
  const history = options.includeHistory
    ? await db.documentExtractionEvent.findMany({
        where: { extraction: { sha256 } },
        select: { type: true, extractionId: true, factId: true, reason: true, payload: true, createdAt: true, actor: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      })
    : null;

  return {
    exists: true as const,
    extraction: {
      id: extraction.id,
      sha256: extraction.sha256,
      status: extraction.status,
      reviewState: extraction.reviewState,
      extractor: { name: extraction.extractorName, version: extraction.extractorVersion, model: extraction.extractorModel },
      methods: extraction.methods,
      language: extraction.language,
      pageCount: extraction.pageCount,
      notes: extraction.notes,
      ...(extraction.failureReason && { failureReason: extraction.failureReason }),
      createdBy: extraction.createdBy.name,
      createdAt: day(extraction.createdAt),
      updatedAt: day(extraction.updatedAt),
      completeness,
      needsHumanCheck: facts.filter((f) => f.state === "active" && f.needsHumanCheck && !f.verifiedAt).length,
      ...(Array.isArray(extraction.conflicts) && extraction.conflicts.length && { conflicts: extraction.conflicts }),
      facts: facts.map(describeFact),
      ...(options.includeFullText && { fullText: (extraction as { text?: { fullText: string } | null }).text?.fullText ?? null }),
    },
    previousExtractions: previous,
    documents: documents.map(describeDocument),
    ...(history && {
      history: history.map((e) => ({ type: e.type, extractionId: e.extractionId, factId: e.factId, by: e.actor.name, reason: e.reason, payload: e.payload, at: day(e.createdAt) })),
    }),
  };
};

// Extraction status for a set of item documents, keyed by document id. Files without a hash are hashed
// (at most hashLimit per call; pages pass 0 so they never wait on storage); unhashed ones come back as not checked.
export const extractionStatusForDocuments = async (
  db: Db,
  documents: { id: string; file: { id: string; sha256: string | null; bucketName: string; objectName: string } }[],
  hashLimit = 25,
) => {
  const hashes = await hashFiles(documents.map((d) => d.file), hashLimit);
  const shas = Array.from(new Set(Array.from(hashes.values()).filter((h): h is string => !!h)));
  const extractions = shas.length
    ? await db.documentExtraction.findMany({
        where: { sha256: { in: shas }, status: { in: ["current", "failed"] } },
        select: {
          id: true,
          sha256: true,
          status: true,
          reviewState: true,
          failureReason: true,
          createdAt: true,
          _count: { select: { facts: true } },
          facts: { where: { needsHumanCheck: true, verifiedAt: null, state: "active" }, select: { id: true } },
        },
      })
    : [];
  const bySha = new Map(extractions.map((e) => [e.sha256, e]));
  return new Map(
    documents.map((d) => {
      const sha256 = hashes.get(d.file.id) ?? null;
      const e = sha256 ? bySha.get(sha256) : undefined;
      const status: DocumentExtractionStatus | "not_checked" = !sha256 ? "not_checked" : !e ? "missing" : (e.status as "current" | "failed");
      return [
        d.id,
        {
          sha256,
          extractionStatus: status,
          ...(e && {
            extractionId: e.id,
            ...(e.status === "current" && { reviewState: e.reviewState, facts: e._count.facts, needsHumanCheck: e.facts.length }),
            ...(e.failureReason && { failureReason: e.failureReason }),
            extractedAt: day(e.createdAt),
          }),
        },
      ] as const;
    }),
  );
};

export type ValueFilter = { op: "lt" | "lte" | "gt" | "gte" | "eq" | "contains"; value: number | string; unit?: string };

export type FactSearch = {
  sha256s?: string[];
  factKey?: string;
  unitFamily?: string | null;
  valueFilter?: ValueFilter;
  claimStatus?: string;
  cas?: string;
  reviewState?: string;
  method?: string;
  needsHumanCheck?: boolean;
  status?: string;
  limit: number;
  cursor?: string;
};

// The where clause for a numeric or text condition on facts. Numbers compare in the key's canonical unit:
// "less than" holds when the lower bound is, "greater than" when the upper bound is.
export const valueCondition = (filter: ValueFilter, unitFamily: string | null | undefined): Prisma.ExtractedFactWhereInput | { error: string } => {
  if (filter.op === "contains") return { printed: { contains: String(filter.value), mode: "insensitive" } };
  const raw = typeof filter.value === "number" ? filter.value : Number(filter.value);
  if (!Number.isFinite(raw)) return { error: `valueFilter.value must be a number for ${filter.op}` };
  let value = raw;
  if (filter.unit) {
    if (!unitFamily) return { error: "valueFilter.unit needs a factKey whose values have a unit family" };
    const converted = toCanonical(unitFamily, raw, filter.unit);
    if (converted === null) return { error: `"${filter.unit}" isn't a ${unitFamily} unit` };
    value = converted;
  }
  switch (filter.op) {
    case "lt":
      return { normalizedValue: { lt: value } };
    case "lte":
      return { normalizedValue: { lte: value } };
    case "gt":
      return { normalizedMax: { gt: value } };
    case "gte":
      return { normalizedMax: { gte: value } };
    case "eq":
      return { normalizedValue: { lte: value }, normalizedMax: { gte: value } };
  }
};

export const searchFacts = async (db: Db, search: FactSearch) => {
  const where: Prisma.ExtractedFactWhereInput = {
    extraction: {
      status: search.status ?? "current",
      ...(search.sha256s && { sha256: { in: search.sha256s } }),
      ...(search.reviewState && { reviewState: search.reviewState }),
    },
    ...(search.factKey && { definition: { key: search.factKey } }),
    ...(search.cas && { componentCas: search.cas.trim() }),
    ...(search.method && { method: search.method }),
    ...(search.needsHumanCheck !== undefined && { needsHumanCheck: search.needsHumanCheck, ...(search.needsHumanCheck && { verifiedAt: null }) }),
    ...(search.claimStatus && { definition: { kind: "claim", ...(search.factKey && { key: search.factKey }) }, value: { equals: { status: search.claimStatus } } }),
    state: "active",
  };
  if (search.valueFilter) {
    const condition = valueCondition(search.valueFilter, search.unitFamily);
    if ("error" in condition) return { error: condition.error as string };
    Object.assign(where, condition);
  }

  const rows = await db.extractedFact.findMany({
    where,
    select: { ...factSelect, extraction: { select: { id: true, sha256: true, reviewState: true, status: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: search.limit + 1,
    ...(search.cursor && { cursor: { id: search.cursor }, skip: 1 }),
  });
  const page = rows.slice(0, search.limit);
  return { facts: page, nextCursor: rows.length > search.limit ? page[page.length - 1]?.id ?? null : null };
};

const toCheckWhere = { needsHumanCheck: true, verifiedAt: null, state: "active" } as const;

export const countExtractionsToReview = (db: Db) =>
  db.documentExtraction.count({ where: { status: "current", facts: { some: toCheckWhere } } });

// What people should look at: facts read from page images or OCR waiting for a check, re-reads that changed
// verified facts, and documents the agent couldn't read. Each with the current documents filed with that file.
export const getExtractionReviewQueue = async (db: Db) => {
  const select = {
    id: true,
    sha256: true,
    status: true,
    reviewState: true,
    methods: true,
    extractorName: true,
    failureReason: true,
    conflicts: true,
    createdAt: true,
    _count: { select: { facts: { where: toCheckWhere } } },
    facts: { where: toCheckWhere, select: { definition: { select: { label: true } } } },
  } as const;
  const [toCheck, withConflicts, failed] = await Promise.all([
    db.documentExtraction.findMany({ where: { status: "current", facts: { some: toCheckWhere } }, select, orderBy: { createdAt: "asc" } }),
    db.documentExtraction.findMany({ where: { status: "current", NOT: { conflicts: { equals: Prisma.DbNull } } }, select, orderBy: { createdAt: "desc" } }),
    db.documentExtraction.findMany({ where: { status: "failed" }, select, orderBy: { createdAt: "desc" } }),
  ]);

  const shas = Array.from(new Set([...toCheck, ...withConflicts, ...failed].map((e) => e.sha256)));
  const documents = shas.length
    ? await db.itemFile.findMany({
        where: { file: { sha256: { in: shas } }, supersededAt: null },
        select: {
          id: true,
          file: { select: { sha256: true, name: true } },
          fileType: { select: { name: true, abbreviaton: true } },
          item: { select: { id: true, name: true, referenceCode: true } },
          supplier: { select: { name: true } },
        },
      })
    : [];
  const docsBySha = new Map<string, typeof documents>();
  for (const d of documents) docsBySha.set(d.file.sha256!, [...(docsBySha.get(d.file.sha256!) ?? []), d]);

  const row = (e: (typeof toCheck)[number]) => ({
    id: e.id,
    status: e.status,
    reviewState: e.reviewState,
    methods: e.methods,
    extractor: e.extractorName,
    failureReason: e.failureReason,
    conflicts: Array.isArray(e.conflicts) ? e.conflicts.length : 0,
    toCheck: e._count.facts,
    keysToCheck: Array.from(new Set(e.facts.map((f) => f.definition.label))),
    createdAt: e.createdAt,
    documents: (docsBySha.get(e.sha256) ?? []).map((d) => ({
      id: d.id,
      name: d.file.name,
      type: d.fileType.abbreviaton ?? d.fileType.name,
      item: d.item,
      supplier: d.supplier?.name ?? null,
    })),
  });

  // documents no longer filed anywhere current don't need a person
  const live = (rows: ReturnType<typeof row>[]) => rows.filter((r) => r.documents.length > 0);
  return {
    toCheck: live(toCheck.map(row)),
    conflicts: live(withConflicts.map(row).filter((r) => r.conflicts > 0)),
    failed: live(failed.map(row)),
  };
};

export type ExtractionReviewQueue = Awaited<ReturnType<typeof getExtractionReviewQueue>>;
