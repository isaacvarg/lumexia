"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createNoteFiles } from "@/actions/notes/createNoteFiles";

export const createSampleNote = async (
  data: Prisma.ExperimentSampleNoteUncheckedCreateInput,
  fileIds: string[] = [],
) => {
  const note = await prisma.experimentSampleNote.create({ data });
  await createNoteFiles("experimentSampleNoteFile", note.id, fileIds);
  return note;
};
