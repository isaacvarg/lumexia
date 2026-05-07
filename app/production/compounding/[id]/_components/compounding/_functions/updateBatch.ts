"use server"

import { advanceBpr } from "@/lib/bpr/transitions"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

export const updateBatch = async (bprId: string) => {

  await advanceBpr(bprId, 'compoundingFinished')

  await createActivityLog('modifyBprStatus', 'bprId', bprId, { context: `Status was changed to Completed automatically by Lumexia due to completing all batch steps` })
}
