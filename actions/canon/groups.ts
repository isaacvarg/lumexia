"use server";

import prisma from "@/lib/prisma";

export const getAllCanonGroups = async () => {
  return prisma.canonDataTypeGroup.findMany({
    include: { _count: { select: { dataTypes: true } } },
    orderBy: [{ sequence: "asc" }, { name: "asc" }],
  });
};

export const createCanonGroup = async (input: { name: string; description?: string | null }) => {
  const last = await prisma.canonDataTypeGroup.findFirst({ orderBy: { sequence: "desc" }, select: { sequence: true } });
  return prisma.canonDataTypeGroup.create({
    data: { name: input.name.trim(), description: input.description || null, sequence: (last?.sequence ?? -1) + 1 },
  });
};

export const updateCanonGroup = async (id: string, input: { name?: string; description?: string | null }) => {
  return prisma.canonDataTypeGroup.update({
    where: { id },
    data: { name: input.name?.trim(), description: input.description },
  });
};

// its data types become ungrouped
export const deleteCanonGroup = async (id: string) => {
  return prisma.canonDataTypeGroup.delete({ where: { id } });
};

// ids in display order
export const reorderCanonGroups = async (ids: string[]) => {
  return prisma.$transaction(
    ids.map((id, sequence) => prisma.canonDataTypeGroup.update({ where: { id }, data: { sequence } })),
  );
};
