"use server";

import prisma from "@/lib/prisma";

export const deleteSampleNote = async ({ id }: { id: string }) => {
  return prisma.$transaction([
    prisma.experimentSampleNoteFile.deleteMany({
      where: { experimentSampleNoteId: id },
    }),
    prisma.experimentSampleNote.delete({ where: { id } }),
  ]);
};
