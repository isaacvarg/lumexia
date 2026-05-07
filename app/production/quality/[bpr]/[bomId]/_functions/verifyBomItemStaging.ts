"use server"

import { revalidatePage } from "@/actions/app/revalidatePage";
import bprStagingVerificationActions from "@/actions/production/bprStagingVerifications";
import bprStagingActions from "@/actions/production/bprStagings";
import { getUserId } from "@/actions/users/getUserId"
import { bprStagingStatuses } from "@/configs/staticRecords/bprStagingStatuses";
import { ExBprStaging } from "@/types/bprStaging";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";

export const verifyBomItemStaging = async (staging: ExBprStaging, isSecondary: boolean) => {

  const userId = await getUserId();
  const { primaryVerified, secondaryVerified } = bprStagingStatuses;

  const statusId = isSecondary ? secondaryVerified : primaryVerified


  // make the verification entry
  const verificatioPayload = {
    userId,
    bprStagingId: staging.id,
  }

  const verification = await bprStagingVerificationActions.createNew(verificatioPayload);

  // change staging status

  const stagingUpdate = await bprStagingActions.update({ id: staging.id }, { bprStagingStatusId: statusId })


  // create activity log 
  createActivityLog('verifyBomStaging', 'staging', staging.id, { context: `Staging Item was verified.`, verificationId: verification.id })

  revalidatePage("/production/quality/[bpr]/[bomId]")

}
