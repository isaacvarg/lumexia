"use server";

import prisma from "@/lib/prisma";

export const deleteExperimentVariant = async ({ id }: { id: string }) => {
  const sampleCount = await prisma.experimentSample.count({
    where: { experimentVariantId: id },
  });
  if (sampleCount > 0) {
    throw new Error(
      `Cannot delete variant: it has ${sampleCount} sample${sampleCount === 1 ? "" : "s"}. Delete samples first.`,
    );
  }

  return prisma.$transaction([
    prisma.experimentVariantMaterial.deleteMany({ where: { experimentVariantId: id } }),
    prisma.experimentVariant.delete({ where: { id } }),
  ]);
};
