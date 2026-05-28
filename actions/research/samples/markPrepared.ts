"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/actions/users/getUserId";

export const markExperimentSamplePrepared = async ({ id }: { id: string }) => {
  const userId = await getUserId();
  return prisma.experimentSample.update({
    where: { id },
    data: { preparedAt: new Date(), preparedById: userId },
  });
};
