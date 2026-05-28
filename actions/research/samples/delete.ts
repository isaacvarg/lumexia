"use server";

import prisma from "@/lib/prisma";

export const deleteExperimentSample = async ({ id }: { id: string }) => {
  return prisma.experimentSample.delete({ where: { id } });
};
