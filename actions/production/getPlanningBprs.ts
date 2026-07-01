'use server'
import { bprStatuses } from "@/configs/staticRecords/bprStatuses";
import { getBprOverviews } from "@/lib/bpr/bprOverview";
import prisma from "@/lib/prisma";

const { failed, released } = bprStatuses;

export const getPlanningBprs = async () => {
  const bprs = await prisma.batchProductionRecord.findMany({
    where: {
      NOT: {
        bprStatusId: {
          in: [failed, released]
        }
      }
    },
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

  const fixed = bprs.map((bpr) => ({
    ...bpr,
    producedItemName: bpr.mbpr.producesItem.name,
    bprStatusName: bpr.status.name,
    overview: overviews[bpr.id] ?? null,
  }));

  return fixed;
}


export type PlanningBpr = Awaited<ReturnType<typeof getPlanningBprs>>[number];
