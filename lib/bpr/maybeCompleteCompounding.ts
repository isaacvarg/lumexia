import { bprBatchStepStatuses } from "@/configs/staticRecords/bprBatchStepStatuses";
import prisma from "@/lib/prisma";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { advanceBpr } from "./transitions";

export const maybeCompleteCompounding = async (bprId: string) => {
  const steps = await prisma.bprBatchStep.findMany({
    where: { bprId },
    select: { statusId: true },
  });

  const allComplete = steps.length > 0 && steps.every(
    (s) => s.statusId === bprBatchStepStatuses.completed
  );

  if (!allComplete) return;

  await advanceBpr(bprId, 'compoundingFinished');
  await createActivityLog('updateBpr', 'bpr', bprId, {
    context: `All batch steps completed; BPR transitioned from compounding to completed`,
  });
};
