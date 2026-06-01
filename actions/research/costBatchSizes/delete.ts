"use server";

import prisma from "@/lib/prisma";

export const deleteCostBatchSize = async ({ id }: { id: string }) => {
  return prisma.experimentCostBatchSize.delete({ where: { id } });
};
