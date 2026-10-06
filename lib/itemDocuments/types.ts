import { ItemDocumentRequirement } from "@prisma/client";

export type RequirementLevel = "required" | "optional" | "excluded";
export type RequirementScope = "item" | "lot";
export type DocumentIssuer = "supplier" | "internal";
export type RequirementIssuer = DocumentIssuer | "any";

// Per document, from best to worst: current, expiring, undated, stale, expired.
// A requirement adds missing (no candidate document) and, for lot scope, notApplicable (no lots to check).
export type DocumentStatus = "current" | "expiring" | "undated" | "stale" | "expired";
export type RequirementStatus = DocumentStatus | "missing" | "notApplicable";

export type Requirement = Pick<
  ItemDocumentRequirement,
  | "id"
  | "itemTypeId"
  | "procurementTypeId"
  | "fileTypeId"
  | "level"
  | "scope"
  | "issuer"
  | "validForMonths"
  | "minIssuedAt"
  | "warnDays"
  | "notes"
  | "createdAt"
>;

export type RequirementSubject = {
  itemTypeId: string;
  procurementTypeId: string;
};

export type DocumentRecord = {
  id: string;
  fileTypeId: string;
  issuer: string;
  lotId: string | null;
  supplierId: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  supersededAt: Date | null;
  derivedFrom: { supersededAt: Date | null } | null;
};

export type LotRecord = {
  id: string;
  lotNumber: string;
  originType: string | null;
  createdAt: Date;
  onHand: number;
};

export type EvaluatedDocument = {
  documentId: string;
  status: DocumentStatus;
  effectiveExpiresAt: Date | null;
};

export type EvaluatedLot = {
  lotId: string;
  lotNumber: string;
  // false for lots whose origin doesn't match the requirement's issuer (e.g. manually created lots),
  // and for lots that predate the requirement and are used up
  counted: boolean;
  status: RequirementStatus;
  documents: EvaluatedDocument[];
};

export type EvaluatedRequirement = {
  requirement: Requirement;
  status: RequirementStatus;
  // item scope: the current documents for this requirement, best first
  documents: EvaluatedDocument[];
  // lot scope only
  lots: EvaluatedLot[] | null;
};
