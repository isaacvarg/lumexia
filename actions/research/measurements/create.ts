"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/actions/users/getUserId";

type CreateMeasurementInput = {
  value: string;
  inputDefinitions: { id: string; value: string }[];
};

export const createSampleMeasurement = async (
  sampleId: string,
  qcParameterId: string,
  data: CreateMeasurementInput,
) => {
  const { value, inputDefinitions } = data;
  const userId = await getUserId();

  return prisma.$transaction(async (tx) => {
    const last = await tx.experimentSampleMeasurement.findFirst({
      where: { sampleId, qcParameterId },
      orderBy: { runNumber: "desc" },
      select: { runNumber: true },
    });
    const runNumber = (last?.runNumber ?? 0) + 1;

    const measurement = await tx.experimentSampleMeasurement.create({
      data: {
        sampleId,
        qcParameterId,
        value,
        runNumber,
        createdById: userId,
      },
    });

    if (inputDefinitions && Array.isArray(inputDefinitions)) {
      await Promise.all(
        inputDefinitions.map((def) =>
          tx.experimentSampleMeasurementInput.create({
            data: {
              measurementId: measurement.id,
              parameterInputDefinitionId: def.id,
              value: def.value,
            },
          }),
        ),
      );
    }

    return measurement;
  });
};
