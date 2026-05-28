"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createNoteFiles } from "@/actions/notes/createNoteFiles";

export const createExperimentNote = async (
  data: Prisma.ExperimentNoteUncheckedCreateInput,
  fileIds: string[] = [],
) => {
  const note = await prisma.experimentNote.create({ data });
  await createNoteFiles("experimentNoteFile", note.id, fileIds);
  return note;
};
