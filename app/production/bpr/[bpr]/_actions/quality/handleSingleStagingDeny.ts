'use server'

import prisma from "@/lib/prisma"
import { BprStagingItem } from "../getBprStagings"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { bprStagingStatuses } from "@/configs/staticRecords/bprStagingStatuses";
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { getUserId } from "@/actions/users/getUserId";

export const handleSingleStagingDeny = async (qualityMode: 'primary' | 'secondary', note: string, staging: BprStagingItem, bprId: string, itemName: string) => {

  const userId = await getUserId();

  const response = await prisma.bprStaging.update({
    where: {
      id: staging.id,
    },
    data: {
      bprStagingStatusId: bprStagingStatuses.denied,
    }
  });

  await prisma.bprStagingDenial.create({
    data: {
      userId,
      bprStagingId: staging.id,
      type: qualityMode,
      reason: note,
    }
  });

  await prisma.bprBillOfMaterials.update({
    where: {
      id: staging.bprBomId,
    },
    data: {
      statusId: bprBomLineStatuses.pending,
    }
  });

  await createActivityLog('stagingDenied', 'bpr', bprId, { context: `${staging.quantity} of ${itemName} was denied during ${qualityMode} verification.` })

  return response;

}
