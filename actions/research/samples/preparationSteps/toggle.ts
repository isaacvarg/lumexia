"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/actions/users/getUserId";

type ToggleInput = {
  sampleId: string;
  experimentVariantMaterialId: string;
};

export const toggleSamplePreparationStep = async ({
  sampleId,
  experimentVariantMaterialId,
}: ToggleInput) => {
  const existing = await prisma.experimentSamplePreparationStep.findUnique({
    where: {
      sampleId_experimentVariantMaterialId: {
        sampleId,
        experimentVariantMaterialId,
      },
    },
  });

  if (existing) {
    await prisma.experimentSamplePreparationStep.delete({
      where: { id: existing.id },
    });
    return { checked: false };
  }

  const userId = await getUserId();
  await prisma.experimentSamplePreparationStep.create({
    data: { sampleId, experimentVariantMaterialId, completedById: userId },
  });
  return { checked: true };
};
