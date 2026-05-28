"use server";

import prisma from "@/lib/prisma";

export const getOneExperiment = async (id: string) => {
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: {
      status: true,
      primaryInvestigator: true,
      primarySubject: true,
      experimentGroup: {
        include: { status: true },
      },
    },
  });

  return experiment;
};

export type SingleExperiment = NonNullable<Awaited<ReturnType<typeof getOneExperiment>>>;
