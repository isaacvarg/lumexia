"use server";

import prisma from "@/lib/prisma";

export const deleteExperimentFile = async ({ id }: { id: string }) => {
  return prisma.experimentFile.delete({ where: { id } });
};
