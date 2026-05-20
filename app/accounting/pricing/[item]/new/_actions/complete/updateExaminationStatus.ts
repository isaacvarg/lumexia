'use server'

import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type Client = Prisma.TransactionClient | typeof prisma

export const updateExaminationStatus = async (examinationId: string, client: Client = prisma) => {
  const result = await client.pricingExamination.updateMany({
    where: {
      id: examinationId,
      statusId: pricingExaminationStatuses.queued,
    },
    data: {
      statusId: pricingExaminationStatuses.pendingReview,
    }
  })

  if (result.count === 0) {
    throw new Error(`Cannot mark examination ${examinationId} as pending review: it is not in the queued state.`)
  }
}
