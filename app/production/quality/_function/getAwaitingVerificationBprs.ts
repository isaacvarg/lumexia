"use server"

import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { getBprOverviews } from "@/lib/bpr/bprOverview";
import prisma from "@/lib/prisma";

export const getAwaitingVerificationBprs = async (isSecondary: boolean = false) => {
  const { staged, primaryVerified } = bprBomLineStatuses

  const statusId = isSecondary ? primaryVerified : staged


  const bprs = await prisma.batchProductionRecord.findMany({
    where: {
      BprBillOfMaterials: {
        some: {
          statusId,
        }
      }
    },
    include: {
      status: true,
      batchSize: true,
      mbpr: {
        include: {
          producesItem: true,
        }
      },
      lotOrigin: {
        include: {
          lot: true,
        }
      }

    }
  })

  const overviews = await getBprOverviews(bprs.map(b => ({ id: b.id, bprStatusId: b.bprStatusId })))

  return bprs.map(bpr => ({
    ...bpr,
    overview: overviews[bpr.id] ?? null,
  }))

}

export type AwaitingVerificationBpr = Awaited<ReturnType<typeof getAwaitingVerificationBprs>>[number]
