"use server";

import prisma from "@/lib/prisma";

export const deleteSampleFile = async ({ id }: { id: string }) => {
  return prisma.experimentSampleFile.delete({ where: { id } });
};
