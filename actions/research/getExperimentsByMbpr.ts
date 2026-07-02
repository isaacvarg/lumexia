"use server";

import prisma from "@/lib/prisma";

// Experiments that have at least one variant made as an analog of the given MBPR
// version (variant.sourceMbprId === mbprId).
export const getExperimentsByMbpr = async (mbprId: string) => {
  const experiments = await prisma.experiment.findMany({
    where: {
      variants: {
        some: {
          sourceMbprId: mbprId,
        },
      },
    },
    include: {
      status: true,
      primarySubject: true,
      variants: {
        where: {
          sourceMbprId: mbprId,
        },
        select: {
          id: true,
          label: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return experiments;
};

export type ExperimentByMbpr = Awaited<
  ReturnType<typeof getExperimentsByMbpr>
>[number];
