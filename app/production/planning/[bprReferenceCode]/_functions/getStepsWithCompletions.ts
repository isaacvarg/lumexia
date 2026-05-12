"use server"

import { fileActions } from "@/actions/files"
import { stepActionableTypes } from "@/configs/staticRecords/stepActionableTypes"
import prisma from "@/lib/prisma"

export const getStepsWithCompletions = async (bprId: string) => {
  const steps = await prisma.bprBatchStep.findMany({
    where: { bprId },
    orderBy: { batchStep: { sequence: 'asc' } },
    include: {
      status: true,
      batchStep: true,
      bprStepActionables: {
        where: {
          stepActionable: {
            actionableTypeId: { not: stepActionableTypes.completeStep },
          },
        },
        include: {
          status: true,
          stepActionable: {
            include: { actionableType: true },
          },
          completion: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              completedByUser: true,
              files: { include: { file: true } },
            },
          },
        },
      },
    },
  })

  // Presign URLs for any photo files so the tab can render them as images.
  const stepsWithUrls = await Promise.all(
    steps.map(async step => ({
      ...step,
      bprStepActionables: await Promise.all(
        step.bprStepActionables.map(async actionable => {
          const completion = actionable.completion[0]
          if (!completion) return actionable

          const filesWithUrls = await Promise.all(
            completion.files.map(async f => ({
              ...f,
              url: await fileActions.getUrl(f.file.bucketName, f.file.objectName),
            }))
          )

          return {
            ...actionable,
            completion: [{ ...completion, files: filesWithUrls }],
          }
        })
      ),
    }))
  )

  return stepsWithUrls
}

export type BprPlanningStep = Awaited<ReturnType<typeof getStepsWithCompletions>>[number]
