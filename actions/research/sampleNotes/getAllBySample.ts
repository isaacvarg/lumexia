"use server";

import prisma from "@/lib/prisma";
import { resolveNoteFiles } from "@/actions/notes/resolveNoteFiles";

export const getAllSampleNotesBySample = async (sampleId: string) => {
  const notes = await prisma.experimentSampleNote.findMany({
    where: { sampleId },
    include: {
      noteType: true,
      user: true,
      files: { include: { file: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return resolveNoteFiles(notes);
};

export type SampleNoteRow = Awaited<
  ReturnType<typeof getAllSampleNotesBySample>
>[number];
