"use server";

import prisma from "@/lib/prisma";

export const getAllMeasurementsBySample = async (sampleId: string) => {
  const measurements = await prisma.experimentSampleMeasurement.findMany({
    where: { sampleId },
    include: {
      inputResults: true,
      qcParameter: true,
    },
    orderBy: [{ qcParameterId: "asc" }, { runNumber: "asc" }],
  });

  return measurements;
};

export type SampleMeasurementRow = Awaited<
  ReturnType<typeof getAllMeasurementsBySample>
>[number];
