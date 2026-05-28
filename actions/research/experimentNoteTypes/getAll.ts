"use server";

import prisma from "@/lib/prisma";

export const getAllExperimentNoteTypes = async () => {
  return prisma.experimentNoteType.findMany({
    orderBy: { name: "asc" },
  });
};

export type ExperimentNoteTypeRow = Awaited<
  ReturnType<typeof getAllExperimentNoteTypes>
>[number];
