"use server";

import prisma from "@/lib/prisma";

type UpdateSampleInput = {
  id: string;
  label?: string;
  size?: number;
  uomId?: string;
};

export const updateExperimentSample = async ({
  id,
  label,
  size,
  uomId,
}: UpdateSampleInput) => {
  const data: Record<string, unknown> = {};
  if (label !== undefined) data.label = label;
  if (size !== undefined) data.size = size;
  if (uomId !== undefined) data.uomId = uomId;

  return prisma.experimentSample.update({
    where: { id },
    data,
  });
};
