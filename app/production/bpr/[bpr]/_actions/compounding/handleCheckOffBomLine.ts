'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "@/actions/users/getUserId"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses"

const ALLOWANCE_THRESHOLD = 0.005;

export const handleCheckOffBomLine = async (bprBomId: string) => {
  const userId = await getUserId();

  const bomLine = await prisma.bprBillOfMaterials.findUnique({
    where: { id: bprBomId },
    include: {
      bom: { include: { item: true } },
      bpr: { select: { id: true } },
    },
  });
  if (!bomLine) throw new Error(`BPR BOM line ${bprBomId} not found`);
  if (bomLine.addedAt) throw new Error(`BPR BOM line ${bprBomId} is already checked off`);

  if (bomLine.statusId !== bprBomLineStatuses.secondaryVerified) {
    throw new Error(`BPR BOM line ${bprBomId} cannot be checked off: status must be secondaryVerified.`);
  }

  // Stagings under this BOM line must sum to (or above) the required quantity
  // within the same allowance threshold the staging UI uses.
  const stagings = await prisma.bprStaging.findMany({
    where: { bprBomId, bprStagingStatusId: { not: bprBomLineStatuses.consumed } },
    select: { quantity: true, bprStagingStatusId: true },
  });
  const stagedQuantity = stagings.reduce((sum, s) => sum + s.quantity, 0);
  const lower = bomLine.quantity - bomLine.quantity * ALLOWANCE_THRESHOLD;
  if (stagedQuantity < lower) {
    throw new Error(`BPR BOM line ${bprBomId} cannot be checked off: staged quantity ${stagedQuantity} is below required ${bomLine.quantity}.`);
  }

  const updated = await prisma.bprBillOfMaterials.update({
    where: { id: bprBomId },
    data: {
      addedAt: new Date(),
      addedByUserId: userId,
    },
  });

  await createActivityLog(
    'checkOffBomLine',
    'bpr',
    bomLine.bpr.id,
    { context: `${bomLine.bom.item.name} (#${bomLine.bom.identifier}) was checked off as added to the batch.` }
  );

  return updated;
}
