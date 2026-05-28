"use server";

import prisma from "@/lib/prisma";

type UpdateMaterialInput = {
  id: string;
  concentration: number;
};

export const updateExperimentVariantMaterial = async ({ id, concentration }: UpdateMaterialInput) => {
  return prisma.experimentVariantMaterial.update({
    where: { id },
    data: { concentration },
  });
};
