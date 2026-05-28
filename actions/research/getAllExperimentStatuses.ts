"use server";

import prisma from "@/lib/prisma";

export const getAllExperimentStatuses = async () => {
  return prisma.experimentStatus.findMany({
    orderBy: { sequence: "asc" },
  });
};

export type ExperimentStatus = Awaited<ReturnType<typeof getAllExperimentStatuses>>[number];
