'use server'

import prisma from "@/lib/prisma";

export const handleResultDelete = async (parameterResultId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.qcParameterInputResult.deleteMany({
      where: { qcResultId: parameterResultId },
    });
    return await tx.qcParameterResult.delete({
      where: { id: parameterResultId },
    });
  });
}
