"use server";

import prisma from "@/lib/prisma";

type RenamePhaseInput = {
  variantId: string;
  from: string;
  to: string | null;
};

export const renameExperimentVariantPhase = async ({
  variantId,
  from,
  to,
}: RenamePhaseInput) => {
  const normalizedTo = to && to.trim() ? to.trim() : null;
  return prisma.experimentVariantMaterial.updateMany({
    where: { experimentVariantId: variantId, phase: from },
    data: { phase: normalizedTo },
  });
};
