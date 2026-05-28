"use server";

import prisma from "@/lib/prisma";

type CreateInput = {
  experimentId: string;
  fileId: string;
};

export const createExperimentFile = async ({ experimentId, fileId }: CreateInput) => {
  return prisma.experimentFile.create({
    data: { experimentId, fileId },
  });
};
