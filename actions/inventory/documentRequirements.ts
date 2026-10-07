"use server";

import prisma from "@/lib/prisma";
import { RequirementInput, validateRequirement } from "@/lib/itemDocuments/rules";

type Result = { success: true } | { success: false; error: string };

export const getAllDocumentRequirements = async () => {
  return prisma.itemDocumentRequirement.findMany({
    include: {
      itemType: { select: { id: true, name: true } },
      procurementType: { select: { id: true, name: true } },
      fileType: { select: { id: true, name: true, abbreviaton: true, bgColor: true, textColor: true } },
    },
    orderBy: { createdAt: "asc" },
  });
};

export type DocumentRequirementRow = Awaited<ReturnType<typeof getAllDocumentRequirements>>[number];

const normalize = (input: RequirementInput): RequirementInput => ({
  ...input,
  itemTypeId: input.itemTypeId || null,
  procurementTypeId: input.procurementTypeId || null,
  lotOrigin: input.scope === "lot" ? input.lotOrigin || null : null,
  notes: input.notes?.trim() || null,
});

const check = async (input: RequirementInput, id?: string) => {
  const existing = await prisma.itemDocumentRequirement.findMany({
    select: { id: true, itemTypeId: true, procurementTypeId: true, sold: true, fileTypeId: true, issuer: true },
  });
  return validateRequirement(input, existing, id);
};

export const createDocumentRequirement = async (raw: RequirementInput): Promise<Result> => {
  const input = normalize(raw);
  const error = await check(input);
  if (error) return { success: false, error };
  await prisma.itemDocumentRequirement.create({ data: input });
  return { success: true };
};

export const updateDocumentRequirement = async (id: string, raw: RequirementInput): Promise<Result> => {
  const input = normalize(raw);
  const error = await check(input, id);
  if (error) return { success: false, error };
  await prisma.itemDocumentRequirement.update({ where: { id }, data: input });
  return { success: true };
};

export const deleteDocumentRequirement = async (id: string) => {
  await prisma.itemDocumentRequirement.delete({ where: { id } });
};
