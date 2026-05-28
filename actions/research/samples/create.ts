"use server";

import prisma from "@/lib/prisma";

type CreateSampleInput = {
  experimentId: string;
  experimentVariantId: string;
  label: string;
  size: number;
  uomId: string;
};

export const createExperimentSample = async ({
  experimentId,
  experimentVariantId,
  label,
  size,
  uomId,
}: CreateSampleInput) => {
  return prisma.experimentSample.create({
    data: { experimentId, experimentVariantId, label, size, uomId },
  });
};
