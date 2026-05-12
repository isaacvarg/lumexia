'use server'

import { getUserId } from "@/actions/users/getUserId"
import { bprStepActionableStatuses } from "@/configs/staticRecords/bprStepActionableStatuses"
import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

type Payload = {
  bprStepActionableId: string
  value: string
  fileIds?: string[]
}

export const handleSubmitActionable = async ({ bprStepActionableId, value, fileIds = [] }: Payload) => {
  const userId = await getUserId()

  const actionable = await prisma.bprStepActionable.findUnique({
    where: { id: bprStepActionableId },
    include: {
      stepActionable: { include: { actionableType: true } },
      bprBatchStep: true,
    },
  })

  if (!actionable) throw new Error("Actionable not found")

  const { dataType, config: rawConfig } = actionable.stepActionable.actionableType
  const config = (rawConfig ?? null) as Record<string, unknown> | null

  if (dataType === 'numeric') {
    const num = Number(value)
    if (!Number.isFinite(num)) throw new Error("Value must be a number")
    if (config) {
      if (typeof config.min === 'number' && num < config.min) {
        throw new Error(`Value must be ≥ ${config.min}`)
      }
      if (typeof config.max === 'number' && num > config.max) {
        throw new Error(`Value must be ≤ ${config.max}`)
      }
    }
  } else if (dataType === 'text') {
    const maxLength = config && typeof config.maxLength === 'number' ? config.maxLength : null
    if (maxLength !== null && value.length > maxLength) {
      throw new Error(`Text exceeds max length of ${maxLength}`)
    }
  } else if (dataType === 'photo') {
    if (fileIds.length === 0) throw new Error("At least one file is required")
    const maxFiles = config && typeof config.maxFiles === 'number' ? config.maxFiles : null
    if (maxFiles !== null && fileIds.length > maxFiles) {
      throw new Error(`Too many files (max ${maxFiles})`)
    }
  }

  const result = await prisma.$transaction(async tx => {
    const completion = await tx.bprStepActionableCompletion.create({
      data: {
        completedByUserId: userId,
        bprStepActionableId,
        value,
      },
    })

    if (dataType === 'photo' && fileIds.length > 0) {
      await tx.bprStepActionableCompletionFile.createMany({
        data: fileIds.map(fileId => ({ fileId, completionId: completion.id })),
      })
    }

    const nextStatusId = actionable.stepActionable.verificationRequired
      ? bprStepActionableStatuses.primaryVerification
      : bprStepActionableStatuses.completed

    const updated = await tx.bprStepActionable.update({
      where: { id: bprStepActionableId },
      data: {
        isCompounded: true,
        statusId: nextStatusId,
      },
    })

    return { completion, updated }
  })

  await createActivityLog('completeBprActionable', 'bpr', actionable.bprBatchStep.bprId, {
    context: `Submitted actionable (${dataType})`,
    bprStepActionableId,
    completionId: result.completion.id,
  })

  return result
}
