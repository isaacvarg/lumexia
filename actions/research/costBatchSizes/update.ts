"use server";

import prisma from "@/lib/prisma";

type UpdateInput = {
  id: string;
  label?: string;
  quantityLb?: number;
};

export const updateCostBatchSize = async ({ id, label, quantityLb }: UpdateInput) => {
  return prisma.experimentCostBatchSize.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(quantityLb !== undefined && { quantityLb }),
    },
  });
};
