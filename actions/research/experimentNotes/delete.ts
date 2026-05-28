"use server";

import prisma from "@/lib/prisma";

export const deleteExperimentNote = async ({ id }: { id: string }) => {
  return prisma.$transaction([
    prisma.experimentNoteFile.deleteMany({ where: { experimentNoteId: id } }),
    prisma.experimentNote.delete({ where: { id } }),
  ]);
};
