"use server";

import prisma from "@/lib/prisma";

type UpdateVariantInput = {
  id: string;
  label: string;
};

export const updateExperimentVariant = async ({ id, label }: UpdateVariantInput) => {
  return prisma.experimentVariant.update({
    where: { id },
    data: { label },
  });
};
