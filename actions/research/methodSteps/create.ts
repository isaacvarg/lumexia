"use server";

import prisma from "@/lib/prisma";

type CreateMethodStepInput = {
  experimentVariantId: string;
  content: string;
  phase?: string | null;
};

export const createVariantMethodStep = async ({
  experimentVariantId,
  content,
  phase = null,
}: CreateMethodStepInput) => {
  const last = await prisma.experimentVariantMethodStep.findFirst({
    where: { experimentVariantId },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  const sequence = (last?.sequence ?? -1) + 1;

  return prisma.experimentVariantMethodStep.create({
    data: {
      experimentVariantId,
      content,
      phase: phase && phase.trim() ? phase.trim() : null,
      sequence,
    },
  });
};
