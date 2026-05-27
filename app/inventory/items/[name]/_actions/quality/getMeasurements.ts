'use server'

import prisma from "@/lib/prisma"

export const getItemMeasurements = async (itemId: string) => {
  const results = await prisma.qcParameterResult.findMany({
    where: {
      qcRecord: {
        examinedLot: {
          is: {
            itemId,
          },
        },
      },
    },
    include: {
      qcItemParameter: {
        include: {
          parameter: {
            include: {
              inputDefinitions: true,
            },
          },
        },
      },
      parameterInputResults: {
        include: {
          parameterInputDefinition: true,
        },
      },
      qcRecord: {
        include: {
          examinedLot: true,
          examinationType: true,
          status: true,
          conductedBy: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
      { runNumber: 'asc' },
    ],
  })

  return results
}

export type QcMeasurementRow = Awaited<ReturnType<typeof getItemMeasurements>>[number]
