"use server";

import prisma from "@/lib/prisma";

type UpdateMeasurementInput = {
  value: string;
  inputDefinitions: { resultId: string; value: string }[];
};

export const updateSampleMeasurement = async (
  measurementId: string,
  data: UpdateMeasurementInput,
) => {
  const { value, inputDefinitions } = data;

  const measurement = await prisma.experimentSampleMeasurement.update({
    where: { id: measurementId },
    data: { value },
  });

  await Promise.all(
    inputDefinitions.map((def) =>
      prisma.experimentSampleMeasurementInput.update({
        where: { id: def.resultId },
        data: { value: def.value },
      }),
    ),
  );

  return measurement;
};
