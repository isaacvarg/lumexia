"use server";

import prisma from "@/lib/prisma";
import { canonDependencyKinds } from "@/configs/staticRecords/canonDependencyKinds";
import { createsCycle, dependencyKindSubjects } from "@/lib/canon/graph";

const kindKeyById = Object.fromEntries(
  Object.entries(canonDependencyKinds).map(([key, id]) => [id, key]),
) as Record<string, keyof typeof canonDependencyKinds>;

export const createCanonDependency = async (input: { parentId: string; childId: string; kindId: string }) => {
  const [parent, child] = await Promise.all([
    prisma.canonDataType.findUniqueOrThrow({ where: { id: input.parentId } }),
    prisma.canonDataType.findUniqueOrThrow({ where: { id: input.childId } }),
  ]);

  const kindKey = kindKeyById[input.kindId];
  if (!kindKey) throw new Error("Unknown dependency kind.");

  const expected = dependencyKindSubjects[kindKey];
  const subjectsMatch =
    kindKey === "sameSubject"
      ? parent.subjectTypeId === child.subjectTypeId
      : parent.subjectTypeId === expected.parent && child.subjectTypeId === expected.child;
  if (!subjectsMatch) {
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
