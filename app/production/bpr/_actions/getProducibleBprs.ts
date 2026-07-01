import { getBprOverviews } from "@/lib/bpr/bprOverview";
import prisma from "@/lib/prisma";
import { DateTime } from "luxon"

export const getProducibleBprs = async () => {
  const now = DateTime.now();

  const startOfWeek = now.startOf('week').toISO();
  const endOfWeek = now.endOf('week').plus({ days: 7 }).toISO();


  const bprs = await prisma.batchProductionRecord.findMany({
    where: {
      completedAt: null,
      scheduledForStart: {
        lte: endOfWeek,
      },
      OR: [
        {
          scheduledForEnd: {
            gte: startOfWeek,
          },
        },
        {
          scheduledForEnd: null,
        },
      ],
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

export type ProducibleBpr = Awaited<ReturnType<typeof getProducibleBprs>>[number]
