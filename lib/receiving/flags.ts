import { lotOriginsFor } from "@/lib/itemDocuments/evaluate";
import { EvaluatedRequirement, RequirementStatus } from "@/lib/itemDocuments/types";

// Nothing at receiving blocks; these mark what needs a look afterwards. Only the inspection result is
// stored. The rest are worked out from current data, so e.g. a COA filed a week later clears docsMissing.
export type ReceivingFlag = "inspection" | "overReceived" | "shortReceived" | "noSupplierLot" | "docsMissing" | "lotMismatch";

const QUANTITY_EPSILON = 1e-6;

export const lineFlags = (line: { hasIssue: boolean; openQuantity: number; receivedQuantity: number }): ReceivingFlag[] => {
  const flags: ReceivingFlag[] = [];
  if (line.hasIssue) flags.push("inspection");
  if (line.receivedQuantity > line.openQuantity + QUANTITY_EPSILON) flags.push("overReceived");
  if (line.receivedQuantity < line.openQuantity - QUANTITY_EPSILON) flags.push("shortReceived");
  return flags;
};

const missingStatuses: RequirementStatus[] = ["missing", "expired"];

// The status of each lot-level requirement for one lot (only requirements that count that lot).
export const lotRequirementStatuses = (requirements: EvaluatedRequirement[], lotId: string) =>
  requirements.flatMap((r) => {
    const lot = r.lots?.find((l) => l.lotId === lotId && l.counted);
    return lot ? [{ requirement: r.requirement, status: lot.status, documents: lot.documents }] : [];
  });

export const lotFlags = (lot: { id: string; supplierLotNumber: string | null }, requirements: EvaluatedRequirement[]): ReceivingFlag[] => {
  const flags: ReceivingFlag[] = [];
  if (!lot.supplierLotNumber) flags.push("noSupplierLot");
  const statuses = lotRequirementStatuses(requirements, lot.id);
  if (statuses.some((s) => s.requirement.level === "required" && missingStatuses.includes(s.status))) flags.push("docsMissing");
  if (statuses.some((s) => s.status === "mismatch")) flags.push("lotMismatch");
  return flags;
};

// Lot-level requirements a lot we receive now will be checked against.
export const receivedLotRequirements = (requirements: EvaluatedRequirement[]) =>
  requirements.filter((r) => r.requirement.scope === "lot" && lotOriginsFor(r.requirement).received).map((r) => r.requirement);

// Item-level documents that need attention, worth fixing while the paperwork is at hand.
export const itemDocumentGaps = (requirements: EvaluatedRequirement[]) =>
  requirements.filter((r) => r.requirement.scope === "item" && r.status !== "current" && r.status !== "notApplicable");
