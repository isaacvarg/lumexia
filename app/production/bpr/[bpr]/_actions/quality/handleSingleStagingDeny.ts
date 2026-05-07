'use server'

import prisma from "@/lib/prisma"
import { BprStagingItem } from "../getBprStagings"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { bprStagingStatuses } from "@/configs/staticRecords/bprStagingStatuses";
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";

export const handleSingleStagingDeny = async (qualityMode: 'primary' | 'secondary', note: string, staging: BprStagingItem, bprId: string, itemName: string) => {

  // update staging: change status and set verified booleans to false
  const response = await prisma.bprStaging.update({
    where: {
      id: staging.id,
    },
    data: {
      bprStagingStatusId: bprStagingStatuses.denied,
      isPrimaryVerified: false,
      isSecondaryVerified: false // not necessary
    }
  });

  // update bomitem
  await prisma.bprBillOfMaterials.update({
    where: {
      id: staging.bprBomId,
    },
    data: {
      statusId: bprBomLineStatuses.pending,
    }
  });
  // make note
  await createActivityLog('stagingDenied', 'bpr', bprId, { context: `${staging.quantity} of ${itemName} was denied during ${qualityMode} verification.` })

  return response;

}
