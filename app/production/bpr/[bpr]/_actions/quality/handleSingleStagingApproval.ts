'use server'
import prisma from "@/lib/prisma";
import { BprStagingItem } from "../getBprStagings";
import { getUserId } from "@/actions/users/getUserId";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { bprStagingStatuses } from "@/configs/staticRecords/bprStagingStatuses";

const { primaryVerified, secondaryVerified } = bprStagingStatuses;


export const handleSingleStagingApproval = async (qualityMode: 'primary' | 'secondary', staging: BprStagingItem, bprId: string, itemName: string) => {

  const statusId = qualityMode === 'primary' ? primaryVerified : secondaryVerified;
  const userId = await getUserId()

  const response = await prisma.bprStaging.update({
    where: {
      id: staging.id,
    },
    data: {
      bprStagingStatusId: statusId,
      ...(qualityMode === 'primary' ? { isPrimaryVerified: true } : { isSecondaryVerified: true })
    }
  });

  await prisma.bprStagingVerification.create({
    data: {
      userId,
      bprStagingId: staging.id,
      type: qualityMode,
    }
  });

  await createActivityLog('stagingPrimaryVerification', 'bpr', bprId, { context: `${staging.quantity} of ${itemName} passed ${qualityMode} verification` })

  return response;

}
