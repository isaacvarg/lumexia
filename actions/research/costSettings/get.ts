"use server";

import prisma from "@/lib/prisma";

// Ensures the singleton cost-settings row exists and returns it.
export const getCostSettings = async () => {
  const existing = await prisma.experimentCostSetting.findFirst();
  if (existing) return existing;
  return prisma.experimentCostSetting.create({ data: {} });
};

export type CostSettings = Awaited<ReturnType<typeof getCostSettings>>;
