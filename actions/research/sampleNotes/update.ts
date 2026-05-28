"use server";

import prisma from "@/lib/prisma";

type UpdateInput = {
  id: string;
  content?: string;
  noteTypeId?: string;
};

export const updateSampleNote = async ({ id, content, noteTypeId }: UpdateInput) => {
  const data: Record<string, unknown> = {};
  if (content !== undefined) data.content = content;
  if (noteTypeId !== undefined) data.noteTypeId = noteTypeId;
  return prisma.experimentSampleNote.update({ where: { id }, data });
};
