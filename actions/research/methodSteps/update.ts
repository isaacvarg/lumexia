"use server";

import prisma from "@/lib/prisma";

type UpdateMethodStepInput = {
  id: string;
  content?: string;
  phase?: string | null;
};

export const updateVariantMethodStep = async ({
  id,
  content,
  phase,
}: UpdateMethodStepInput) => {
  return prisma.experimentVariantMethodStep.update({
    where: { id },
    data: {
      ...(content !== undefined && { content }),
      ...(phase !== undefined && {
        phase: phase && phase.trim() ? phase.trim() : null,
      }),
    },
  });
};
