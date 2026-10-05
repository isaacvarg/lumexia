import prisma from "@/lib/prisma";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { CanonResolver } from "./types";

export const activeBomResolver: CanonResolver<"billOfMaterials"> = {
  key: "mbpr.activeBom",
  label: "Active MBPR bill of materials",
  description: "The BOM of the item's active MBPR. Changes when an MBPR version is activated or its BOM is edited.",
  shapeKey: "billOfMaterials",
  subjectKind: "item",
  resolve: async (subject) => {
    if (subject.kind !== "item") return null;

    const mbpr = await prisma.masterBatchProductionRecord.findFirst({
      where: { producesItemId: subject.itemId, recordStatusId: recordStatuses.active },
      select: {
        BillOfMaterial: {
          where: { recordStatusId: recordStatuses.active },
          include: { item: { select: { name: true } }, step: { select: { sequence: true, phase: true } } },
          orderBy: { identifier: "asc" },
        },
      },
    });
    if (!mbpr) return null;

    return {
      rows: mbpr.BillOfMaterial.map((line) => ({
        identifier: line.identifier,
        itemId: line.itemId,
        itemName: line.item.name,
        concentration: line.concentration,
        stepSequence: line.step.sequence,
        phase: line.step.phase ?? null,
      })),
    };
  },
};
