"use server";

import prisma from "@/lib/prisma";

type CreateMaterialInput = {
  experimentVariantId: string;
  itemId: string;
  concentration: number;
  phase?: string | null;
};

export const createExperimentVariantMaterial = async (input: CreateMaterialInput) => {
  const max = await prisma.experimentVariantMaterial.aggregate({
    where: { experimentVariantId: input.experimentVariantId },
    _max: { sequence: true },
  });
  const nextSequence = (max._max.sequence ?? -1) + 1;

  return prisma.experimentVariantMaterial.create({
    data: {
      experimentVariantId: input.experimentVariantId,
      itemId: input.itemId,
      concentration: input.concentration,
      sequence: nextSequence,
      phase: input.phase || null,
    },
  });
};
