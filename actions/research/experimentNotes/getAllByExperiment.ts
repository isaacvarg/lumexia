"use server";

import prisma from "@/lib/prisma";
import { resolveNoteFiles } from "@/actions/notes/resolveNoteFiles";

export const getAllExperimentNotesByExperiment = async (experimentId: string) => {
  const notes = await prisma.experimentNote.findMany({
    where: { experimentId },
    include: {
      noteType: true,
      user: true,
      files: { include: { file: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return resolveNoteFiles(notes);
};

export type ExperimentNoteRow = Awaited<
  ReturnType<typeof getAllExperimentNotesByExperiment>
>[number];
