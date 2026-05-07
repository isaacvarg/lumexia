'use server'

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses"

const { primaryVerified, secondaryVerified } = bprBomLineStatuses

export const handleCompleteVerification = async (qualityMode: 'primary' | 'secondary', bprBomItemId: string, bprBomItemName: string, bprId: string) => {
  const statusId = qualityMode === 'primary' ? primaryVerified : secondaryVerified;

  // update bom item
  const response = await prisma.bprBillOfMaterials.update({
    where: {
      id: bprBomItemId,
    },
    data: {
      statusId,
    }
  });

  // make note 
  await createActivityLog('bomItemPrimaryVerification', 'bpr', bprId, { context: `${bprBomItemName} completed ${qualityMode} verification.` })

  return response;
}
