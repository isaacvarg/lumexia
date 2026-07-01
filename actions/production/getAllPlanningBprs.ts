'use server'
import { getBprOverviews } from "@/lib/bpr/bprOverview";
import prisma from "@/lib/prisma";

export const getAllPlanningBprs = async () => {
  const bprs = await prisma.batchProductionRecord.findMany({
    include: {
      status: true,
      mbpr: {
        include: {
          producesItem: true
        }
      },
      lotOrigin: {
        include: {
          lot: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  const overviews = await getBprOverviews(bprs.map(b => ({ id: b.id, bprStatusId: b.bprStatusId })))

  const fixed = bprs.map((bpr) => {
    const overview = overviews[bpr.id] ?? null
    return {
      ...bpr,
      producedItemName: bpr.mbpr.producesItem.name,
      bprStatusName: bpr.status.name,
      overview,
      waitingOnTeam: overview?.teamLabel ?? null,
    }
  });

  return fixed;
}

export type AllPlanningBpr = Awaited<ReturnType<typeof getAllPlanningBprs>>[number];
