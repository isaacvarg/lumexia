"use server";

import prisma from "@/lib/prisma";

type UpdateInput = {
  overheadPercent: number;
  overheadPerLb: number;
};

export const updateCostSettings = async ({
  overheadPercent,
  overheadPerLb,
}: UpdateInput) => {
  const existing = await prisma.experimentCostSetting.findFirst();
  if (!existing) {
    return prisma.experimentCostSetting.create({
      data: { overheadPercent, overheadPerLb },
    });
  }
  return prisma.experimentCostSetting.update({
    where: { id: existing.id },
    data: { overheadPercent, overheadPerLb },
  });
};
