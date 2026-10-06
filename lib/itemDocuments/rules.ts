import { RequirementIssuer, RequirementLevel, RequirementScope } from "./types";

export const requirementLevels: { value: RequirementLevel; label: string; description: string }[] = [
  { value: "required", label: "Required", description: "Items must have this document" },
  { value: "optional", label: "Optional", description: "Shown on the item, but not counted as missing" },
  { value: "excluded", label: "Excluded", description: "Cancels a broader rule for these items" },
];

export const requirementScopes: { value: RequirementScope; label: string; description: string }[] = [
  { value: "item", label: "Per item", description: "One current document for the item" },
  { value: "lot", label: "Per lot", description: "One document for every applicable lot" },
];

export const requirementIssuers: { value: RequirementIssuer; label: string; description: string }[] = [
  { value: "supplier", label: "Supplier", description: "Issued by the supplier or manufacturer" },
  { value: "internal", label: "Internal", description: "Issued or rebranded by us" },
  { value: "any", label: "Either", description: "Supplier or internal" },
];

export type RequirementInput = {
  itemTypeId: string | null;
  procurementTypeId: string | null;
  fileTypeId: string;
  level: string;
  scope: string;
  issuer: string;
  validForMonths: number | null;
  minIssuedAt: Date | null;
  warnDays: number;
  notes: string | null;
};

type ExistingRequirement = Pick<RequirementInput, "itemTypeId" | "procurementTypeId" | "fileTypeId" | "issuer"> & {
  id: string;
};

const isWholeNumber = (n: number) => Number.isInteger(n) && n >= 0;

// Returns an error message, or null when the input can be saved. `existing` is every saved rule;
// pass `id` when updating so the rule doesn't collide with itself.
export const validateRequirement = (
  input: RequirementInput,
  existing: ExistingRequirement[],
  id?: string
): string | null => {
  if (!input.itemTypeId && !input.procurementTypeId) return "Choose an item type, a procurement type, or both.";
  if (!input.fileTypeId) return "Choose a document type.";
  if (!requirementLevels.some((l) => l.value === input.level)) return "Choose a level.";
  if (!requirementScopes.some((s) => s.value === input.scope)) return "Choose per item or per lot.";
  if (!requirementIssuers.some((i) => i.value === input.issuer)) return "Choose who issues the document.";
  if (input.validForMonths != null && (!isWholeNumber(input.validForMonths) || input.validForMonths === 0)) {
    return "Months valid must be a whole number above zero.";
  }
  if (!isWholeNumber(input.warnDays)) return "Warning days must be a whole number.";

  const duplicate = existing.some(
    (r) =>
      r.id !== id &&
      r.itemTypeId === input.itemTypeId &&
      r.procurementTypeId === input.procurementTypeId &&
      r.fileTypeId === input.fileTypeId &&
      r.issuer === input.issuer
  );
  if (duplicate) return "A rule for this document and issuer already exists for these items. Edit that one instead.";

  return null;
};
