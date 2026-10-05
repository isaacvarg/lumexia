"use server";

import prisma from "@/lib/prisma";

// Lookup tables the settings UI needs for selects and labels.
export const getCanonLookups = async () => {
  const [shapes, subjectTypes, dependencyKinds, capabilities, sourceTypes] = await Promise.all([
    prisma.canonShape.findMany({ orderBy: { name: "asc" } }),
    prisma.canonSubjectType.findMany({ orderBy: { name: "asc" } }),
    prisma.canonDependencyKind.findMany({ orderBy: { name: "asc" } }),
    prisma.canonCapability.findMany({ orderBy: { name: "asc" } }),
    prisma.canonSourceType.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { shapes, subjectTypes, dependencyKinds, capabilities, sourceTypes };
};

export type CanonLookups = Awaited<ReturnType<typeof getCanonLookups>>;
