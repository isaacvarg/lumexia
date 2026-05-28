"use server";

import prisma from "@/lib/prisma";

type CreateInput = {
  sampleId: string;
  fileId: string;
};

export const createSampleFile = async ({ sampleId, fileId }: CreateInput) => {
  return prisma.experimentSampleFile.create({
    data: { sampleId, fileId },
  });
};
