"use server";

import prisma from "@/lib/prisma";

type SetPhaseInput = {
  id: string;
  phase: string | null;
};

export const setExperimentVariantMaterialPhase = async ({ id, phase }: SetPhaseInput) => {
  return prisma.experimentVariantMaterial.update({
    where: { id },
    data: { phase: phase && phase.trim() ? phase.trim() : null },
  });
};
