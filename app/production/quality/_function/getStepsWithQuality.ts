import { bprStepActionableStatuses } from "@/configs/staticRecords/bprStepActionableStatuses";
import { getBprOverviews } from "@/lib/bpr/bprOverview";
import prisma from "@/lib/prisma"

export const getStepsWithQuality = async (isSecondary: boolean) => {

  // first we need bprs with a compounding status
  const steps = await getIncompleteBprs(isSecondary)

  const overviews = await getBprOverviews(
    steps.map(s => ({ id: s.bprBatchStep.bpr.id, bprStatusId: s.bprBatchStep.bpr.bprStatusId }))
  )

  return steps.map(step => ({
    ...step,
    bprBatchStep: {
      ...step.bprBatchStep,
      bpr: {
        ...step.bprBatchStep.bpr,
        overview: overviews[step.bprBatchStep.bpr.id] ?? null,
      },
    },
  }))

}



const getIncompleteBprs = async (isSecondary: boolean) => {

  const isVerified = isSecondary ? true : false
  const secondarySpread = isSecondary ? { verificationRequired: true } : { secondaryVerificationRequired: true };
  const statusId = isSecondary ? bprStepActionableStatuses.secondaryVerification : bprStepActionableStatuses.primaryVerification;

  // lol maybe do a sql query instead
  const bprs = await prisma.bprStepActionable.findMany({
    where: {
      AND: [
        { statusId },
        {
          isCompounded: true,
        },
        {
          isVerified,
        },
        {
          stepActionable: {
            ...secondarySpread
          }
        }
      ]
    },
    include: {
      stepActionable: true,
      bprBatchStep: {
        include: {
          batchStep: true,
          bpr: {
            include: {
              status: true,
              mbpr: {
                include: {
                  producesItem: true
                }
              },
              lotOrigin: {
                include: {
                  lot: true,
                }
              }
            }
          }
        }
      },
      status: true,
      completion: true,
    }
  })
  return bprs
}


