"use server";

import prisma from "@/lib/prisma";

export const deleteVariantMethodStep = async ({ id }: { id: string }) => {
  return prisma.experimentVariantMethodStep.delete({
    where: { id },
  });
};
