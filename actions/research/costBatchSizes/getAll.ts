"use server";

import prisma from "@/lib/prisma";

export const getAllCostBatchSizes = async () => {
  return prisma.experimentCostBatchSize.findMany({
    orderBy: [{ sequence: "asc" }, { quantityLb: "asc" }],
  });
};

export type CostBatchSizeRow = Awaited<
  ReturnType<typeof getAllCostBatchSizes>
>[number];
