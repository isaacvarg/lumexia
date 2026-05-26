'use server'

import { qualityActions } from "@/actions/quality"
import prisma from "@/lib/prisma"

export const getResults = async (recordId: string) => {
  const results = await prisma.qcParameterResult.findMany({
    where: {
      qcRecordId: recordId,
    },
    include: {
      parameterInputResults: true,
      qcItemParameter: true,
    },
    orderBy: [
      { qcItemParameterId: 'asc' },
      { runNumber: 'asc' },
    ],
  });

  return results;
}

export type ExaminationResults = Awaited<ReturnType<typeof getResults>>[number];
