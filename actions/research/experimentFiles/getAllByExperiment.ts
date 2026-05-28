"use server";

import prisma from "@/lib/prisma";
import { resolveFileRows } from "@/actions/files/resolveFileRows";

export const getAllExperimentFilesByExperiment = async (experimentId: string) => {
  const rows = await prisma.experimentFile.findMany({
    where: { experimentId },
    include: {
      file: { include: { uploadedBy: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return resolveFileRows(rows);
};

export type ExperimentFileRow = Awaited<
  ReturnType<typeof getAllExperimentFilesByExperiment>
>[number];
