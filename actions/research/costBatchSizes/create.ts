"use server";

import prisma from "@/lib/prisma";

type CreateInput = {
  label: string;
  quantityLb: number;
};

export const createCostBatchSize = async ({ label, quantityLb }: CreateInput) => {
  const last = await prisma.experimentCostBatchSize.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  const sequence = (last?.sequence ?? -1) + 1;

  return prisma.experimentCostBatchSize.create({
    data: { label, quantityLb, sequence },
  });
};
