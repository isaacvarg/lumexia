"use server";

import prisma from "@/lib/prisma";

type CreateVariantInput = {
  experimentId: string;
  label: string;
};

export const createExperimentVariant = async ({ experimentId, label }: CreateVariantInput) => {
  return prisma.experimentVariant.create({
    data: { experimentId, label },
  });
};
