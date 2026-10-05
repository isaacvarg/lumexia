"use server";

import prisma from "@/lib/prisma";
import { createsCycle } from "@/lib/canon/graph";
import { kindKeyById, validDependencyKinds } from "@/lib/canon/dependencyKinds";

export const createCanonDependency = async (input: { parentId: string; childId: string; kindId: string }) => {
  const [parent, child] = await Promise.all([
    prisma.canonDataType.findUniqueOrThrow({ where: { id: input.parentId } }),
    prisma.canonDataType.findUniqueOrThrow({ where: { id: input.childId } }),
  ]);

  if (!kindKeyById[input.kindId]) throw new Error("Unknown dependency kind.");
  if (!validDependencyKinds(parent.subjectTypeId, child.subjectTypeId).includes(input.kindId)) {
    throw new Error(`${parent.name} → ${child.name} can't be connected this way; their subjects don't fit.`);
  }

  if (await createsCycle(prisma, input.parentId, input.childId)) {
    throw new Error(`${child.name} already feeds into ${parent.name}; connecting them would create a loop.`);
  }

  return prisma.canonDataTypeDependency.create({ data: input });
};

// existing versions keep their lineage; statuses settle on the next refresh
export const deleteCanonDependency = async (id: string) => {
  return prisma.canonDataTypeDependency.delete({ where: { id } });
};
