"use server";

import prisma from "@/lib/prisma";

type CreateNoteTypeInput = {
  name: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
};

export const createExperimentNoteType = async (input: CreateNoteTypeInput) => {
  return prisma.experimentNoteType.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      bgColor: input.bgColor ?? "#077202",
      textColor: input.textColor ?? "#000000",
    },
  });
};
