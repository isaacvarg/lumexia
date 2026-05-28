"use server"

import prisma from "@/lib/prisma"

export const getAllExperiments = async () => {
  const experiments = await prisma.experiment.findMany({
    include: {
      status: true,
      primaryInvestigator: true,
      primarySubject: true,
      experimentGroup: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return experiments;
}

export type Experiment = Awaited<ReturnType<typeof getAllExperiments>>[number]
