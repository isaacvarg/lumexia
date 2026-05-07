"use server"

import { revalidatePage } from "@/actions/app/revalidatePage";
import { advanceBpr } from "@/lib/bpr/transitions";
import { BatchProductionRecord } from "@/types/batchProductionRecord";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";

export const handleBeginStaging = async (bpr: BatchProductionRecord) => {
  await advanceBpr(bpr.id, 'stagingStarted')
  await createActivityLog("upateBprStatus", "bpr", bpr.id, { context: `BPR #${bpr.releasedAt} was set to staging from the queued panel` })
  revalidatePage("/production/compounding/[id]/")
}
