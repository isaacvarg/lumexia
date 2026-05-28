"use server";

import prisma from "@/lib/prisma";

export const markExperimentSampleUnprepared = async ({ id }: { id: string }) => {
  return prisma.experimentSample.update({
    where: { id },
    data: { preparedAt: null, preparedById: null },
  });
};
