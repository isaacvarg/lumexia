"use server";

import prisma from "@/lib/prisma";

export const deleteExperimentVariantMaterial = async ({ id }: { id: string }) => {
  return prisma.experimentVariantMaterial.delete({ where: { id } });
};
