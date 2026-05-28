"use server";

import prisma from "@/lib/prisma";
import { resolveFileRows } from "@/actions/files/resolveFileRows";

export const getAllSampleFilesBySample = async (sampleId: string) => {
  const rows = await prisma.experimentSampleFile.findMany({
    where: { sampleId },
    include: { file: { include: { uploadedBy: true } } },
    orderBy: { createdAt: "desc" },
  });
  return resolveFileRows(rows);
};

export type SampleFileRow = Awaited<
  ReturnType<typeof getAllSampleFilesBySample>
>[number];
