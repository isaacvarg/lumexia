"use server";

import prisma from "@/lib/prisma";

export const getAllVariantsByExperiment = async (experimentId: string) => {
  return prisma.experimentVariant.findMany({
    where: { experimentId },
    include: {
      materials: {
        include: { item: true },
        orderBy: { sequence: "asc" },
      },
      methodSteps: {
        orderBy: { sequence: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

export type ExperimentVariantWithMaterials = Awaited<
  ReturnType<typeof getAllVariantsByExperiment>
>[number];
