"use server";

import prisma from "@/lib/prisma";

export const getAllExperimentGroups = async () => {
  const groups = await prisma.experimentGroup.findMany({
    include: {
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return groups;
};

export type ExperimentGroup = Awaited<ReturnType<typeof getAllExperimentGroups>>[number];
