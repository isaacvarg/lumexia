'use server'

import prisma from "@/lib/prisma";

export const handleResultSubmission = async (qcRecordId: string, parameterId: string, itemParameterId: string, data: Record<string, any>) => {

  const { value, inputDefinitions } = data;

  return await prisma.$transaction(async (tx) => {
    const last = await tx.qcParameterResult.findFirst({
      where: { qcRecordId, qcItemParameterId: itemParameterId },
      orderBy: { runNumber: 'desc' },
      select: { runNumber: true },
    });
    const runNumber = (last?.runNumber ?? 0) + 1;

    const result = await tx.qcParameterResult.create({
      data: {
        qcRecordId,
        qcParameterId: parameterId,
        qcItemParameterId: itemParameterId,
        value,
        runNumber,
      }
    });

    if (inputDefinitions && Array.isArray(inputDefinitions)) {
      await Promise.all(inputDefinitions.map((def: any) =>
        tx.qcParameterInputResult.create({
          data: {
            qcResultId: result.id,
            parameterInputDefinitionId: def.id,
            value: def.value,
          }
        })
      ));
    }

    return result;
  });
}
