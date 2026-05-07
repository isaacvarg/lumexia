'use server'

import prisma from "@/lib/prisma"
import { ProductionStep } from "./getSteps"
import { DateTime } from "luxon"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { bprStepActionableStatuses } from "@/configs/staticRecords/bprStepActionableStatuses"
import { bprBatchStepStatuses } from "@/configs/staticRecords/bprBatchStepStatuses"

export const handleCompleteActionable = async (batchStep: ProductionStep, completeActionable: ProductionStep['bprStepActionables'][number]) => {

  // Defense in depth -- mirror the StepActions UI gate so direct callers can't
  // skip it. A step is only completable when every BOM line for it has been
  // checked off and every other actionable is completed.
  const bomLines = await prisma.bprBillOfMaterials.findMany({
    where: { bprId: batchStep.bprId, bom: { stepId: batchStep.batchStepId } },
    select: { id: true, addedAt: true },
  });
  const unaddedLine = bomLines.find(line => line.addedAt === null);
  if (unaddedLine) {
    throw new Error(`Cannot complete batch step: BPR BOM line ${unaddedLine.id} has not been checked off.`);
  }

  const otherActionables = await prisma.bprStepActionable.findMany({
    where: {
      bprBatchStepId: batchStep.id,
      id: { not: completeActionable.id },
    },
    select: { id: true, statusId: true },
  });
  const incompleteActionable = otherActionables.find(a => a.statusId !== bprStepActionableStatuses.completed);
  if (incompleteActionable) {
    throw new Error(`Cannot complete batch step: actionable ${incompleteActionable.id} is not completed.`);
  }

  const timestamp = DateTime.now().toJSDate()

  const response = prisma.bprBatchStep.update({
    where: {
      id: batchStep.id,
    },
    data: {
      completedAt: timestamp,
      isComplete: true,
      statusId: bprBatchStepStatuses.completed,
    }
  });

  await prisma.bprStepActionable.update({
    where: {
      id: completeActionable.id
    },
    data: {
      isCompounded: true,
      statusId: bprStepActionableStatuses.completed
    }
  })

  await createActivityLog('completeBatchStep', 'bpr', batchStep.bprId, { context: `${batchStep.batchStep.phase} ${batchStep.batchStep.label} completed` })

  return response;
}
