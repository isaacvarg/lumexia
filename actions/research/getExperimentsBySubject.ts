"use server";

import prisma from "@/lib/prisma";

export const getExperimentsBySubject = async (subjectItemId: string) => {
  const experiments = await prisma.experiment.findMany({
    where: {
      primarySubjectId: subjectItemId,
    },
    include: {
      status: true,
      primarySubject: true,
      experimentGroup: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return experiments;
};

export type ExperimentBySubject = Awaited<
  ReturnType<typeof getExperimentsBySubject>
>[number];
