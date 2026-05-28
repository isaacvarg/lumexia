"use server";

import prisma from "@/lib/prisma";

export const getAllSamplesByExperiment = async (experimentId: string) => {
  return prisma.experimentSample.findMany({
    where: { experimentId },
    include: {
      uom: true,
      preparedBy: true,
      preparationSteps: true,
    },
    orderBy: [{ experimentVariantId: "asc" }, { referenceCode: "asc" }],
  });
};

export type ExperimentSampleRow = Awaited<
  ReturnType<typeof getAllSamplesByExperiment>
>[number];
