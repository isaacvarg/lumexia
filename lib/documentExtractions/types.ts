// Shared vocabulary for document extractions. Client-safe: no database access.

export const extractionStatuses = ["current", "superseded", "failed"] as const;
export type ExtractionStatus = (typeof extractionStatuses)[number];

export const reviewStates = ["unreviewed", "partially_verified", "verified"] as const;
export type ReviewState = (typeof reviewStates)[number];

// human is only ever written by people in the UI; agents read with the text layer first, then page images
// (vision), then OCR.
export const factMethods = ["text_layer", "vision", "ocr", "human"] as const;
export type FactMethod = (typeof factMethods)[number];
export const agentFactMethods = ["text_layer", "vision", "ocr"] as const;

export const factConfidences = ["high", "medium", "low"] as const;
export type FactConfidence = (typeof factConfidences)[number];

export const factScopes = ["material", "component"] as const;
export type FactScope = (typeof factScopes)[number];

export const factKinds = ["scalar", "enum", "claim", "row", "section"] as const;
export type FactKind = (typeof factKinds)[number];

export const claimStatuses = ["stated", "negated", "not_stated"] as const;
export type ClaimStatus = (typeof claimStatuses)[number];

export const definitionStatuses = ["proposed", "approved", "deprecated"] as const;
export type DefinitionStatus = (typeof definitionStatuses)[number];

// A document's extraction as seen from the document: none yet, one to use, or reading it failed.
export type DocumentExtractionStatus = "missing" | "current" | "failed";

export const extractionEventTypes = [
  "stored",
  "superseded",
  "facts_updated",
  "verification_reset",
  "failed",
  "failure_cleared",
  "verified",
  "unverified",
  "overridden",
  "override_reverted",
  "key_created",
  "key_approved",
  "key_edited",
  "key_merged",
  "key_deprecated",
] as const;
export type ExtractionEventType = (typeof extractionEventTypes)[number];

// Value types for scalar facts and row columns.
export const valueTypes = ["text", "number", "date", "boolean", "cas"] as const;
export type ValueType = (typeof valueTypes)[number];

export type ColumnSchema = {
  name: string;
  type: ValueType | "enum" | "list";
  required?: boolean;
  options?: string[];
  description?: string;
};

// valueSchema per kind:
// - scalar: { type } — a number may be a plain number or { value?, min?, max?, qualifier? } (a range stays a range)
// - enum: { options } — the value is one option
// - claim: {} — the value is { status: stated | negated | not_stated }
// - row: { columns, normalize? } — the value is an object of columns; normalize names the columns holding
//   the lower/upper bound used for numeric search, in the key's unit family
// - section: {} — the value is { present, empty }; no section fact means the section wasn't captured
export type ValueSchema = {
  type?: ValueType;
  options?: string[];
  columns?: ColumnSchema[];
  normalize?: { min: string; max?: string };
  defaultUnit?: string;
};

export type FactDefinitionShape = {
  id: string;
  key: string;
  label: string;
  kind: FactKind;
  valueSchema: ValueSchema;
  unitFamily: string | null;
  safetyRelevant: boolean;
  status: DefinitionStatus;
};

// A fact as an agent sends it.
export type FactInput = {
  key: string;
  scope?: FactScope;
  component?: { name?: string; cas?: string };
  value: unknown;
  printed?: string;
  unit?: string;
  rowIndex?: number;
  page?: { index?: number; label?: string };
  quote: string;
  method: FactMethod;
  confidence: FactConfidence;
  needsHumanCheck?: boolean;
};

// A fact ready to store, after validation and normalization.
export type PreparedFact = {
  definitionId: string;
  key: string;
  scope: FactScope;
  componentName: string | null;
  componentCas: string | null;
  value: unknown;
  printed: string | null;
  unit: string | null;
  normalizedValue: number | null;
  normalizedMax: number | null;
  normalizedUnit: string | null;
  rowIndex: number | null;
  pageIndex: number | null;
  pageLabel: string | null;
  quote: string;
  method: FactMethod;
  confidence: FactConfidence;
  needsHumanCheck: boolean;
};

// A verified fact that a re-extraction changed or dropped.
export type ExtractionConflict = {
  previousFactId: string;
  key: string;
  scope: FactScope;
  component: string | null;
  previousValue: unknown;
  verifiedBy: string | null;
  reason: "changed" | "missing";
  newFactId?: string;
  newValue?: unknown;
};
