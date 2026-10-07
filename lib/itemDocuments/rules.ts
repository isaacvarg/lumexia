import { RequirementIssuer, RequirementLevel, RequirementLotOrigin, RequirementScope } from "./types";

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

export const requirementSoldOptions: { value: boolean | null; label: string; description: string }[] = [
  { value: null, label: "Any", description: "Sold or not" },
  { value: true, label: "Sold", description: "Only items marked as sold" },
  { value: false, label: "Not sold", description: "Only items not marked as sold" },
];

export const requirementLotOrigins: { value: RequirementLotOrigin | null; label: string; description: string }[] = [
  { value: null, label: "By issuer", description: "Supplier documents on received lots, ours on produced lots" },
  { value: "received", label: "Received", description: "Lots received on a purchase order" },
  { value: "produced", label: "Produced", description: "Lots we produced" },
  { value: "both", label: "Both", description: "Received and produced lots" },
];

export type RequirementInput = {
  itemTypeId: string | null;
  procurementTypeId: string | null;
  sold: boolean | null;
  fileTypeId: string;
  level: string;
  scope: string;
  issuer: string;
  lotOrigin: string | null;
  validForMonths: number | null;
  minIssuedAt: Date | null;
  warnDays: number;
  notes: string | null;
};

type ExistingRequirement = Pick<RequirementInput, "itemTypeId" | "procurementTypeId" | "sold" | "fileTypeId" | "issuer"> & {
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
  if (!input.itemTypeId && !input.procurementTypeId && input.sold === null) {
    return "Choose an item type, a procurement type, or sold items.";
  }
  if (!input.fileTypeId) return "Choose a document type.";
  if (!requirementLevels.some((l) => l.value === input.level)) return "Choose a level.";
  if (!requirementScopes.some((s) => s.value === input.scope)) return "Choose per item or per lot.";
  if (!requirementIssuers.some((i) => i.value === input.issuer)) return "Choose who issues the document.";
  if (input.lotOrigin !== null && (input.scope !== "lot" || !requirementLotOrigins.some((o) => o.value === input.lotOrigin))) {
    return "Choose which lots this applies to, or leave it by issuer.";
  }
  if (input.validForMonths != null && (!isWholeNumber(input.validForMonths) || input.validForMonths === 0)) {
    return "Months valid must be a whole number above zero.";
  }
  if (!isWholeNumber(input.warnDays)) return "Warning days must be a whole number.";

  const duplicate = existing.some(
    (r) =>
      r.id !== id &&
      r.itemTypeId === input.itemTypeId &&
      r.procurementTypeId === input.procurementTypeId &&
      r.sold === input.sold &&
      r.fileTypeId === input.fileTypeId &&
      r.issuer === input.issuer
  );
  if (duplicate) return "A rule for this document and issuer already exists for these items. Edit that one instead.";

  return null;
};
