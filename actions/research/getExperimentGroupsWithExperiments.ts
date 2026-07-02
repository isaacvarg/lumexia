"use server";

import prisma from "@/lib/prisma";

export const getExperimentGroupsWithExperiments = async () => {
  const groups = await prisma.experimentGroup.findMany({
    include: {
      status: true,
      experiments: {
        include: {
          status: true,
          primarySubject: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return groups;
};

export type ExperimentGroupWithExperiments = Awaited<
  ReturnType<typeof getExperimentGroupsWithExperiments>
>[number];
