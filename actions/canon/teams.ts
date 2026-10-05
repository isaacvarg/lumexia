"use server";

import prisma from "@/lib/prisma";

export const getAllCanonTeams = async () => {
  return prisma.canonTeam.findMany({
    include: { members: { include: { user: { select: { id: true, name: true, image: true } } } } },
    orderBy: { name: "asc" },
  });
};

export const createCanonTeam = async (input: { name: string; description?: string | null }) => {
  return prisma.canonTeam.create({ data: { name: input.name.trim(), description: input.description || null } });
};

export const updateCanonTeam = async (id: string, input: { name?: string; description?: string | null }) => {
  return prisma.canonTeam.update({
    where: { id },
    data: { name: input.name?.trim(), description: input.description },
  });
};

// members and the team's grants cascade
export const deleteCanonTeam = async (id: string) => {
  return prisma.canonTeam.delete({ where: { id } });
};

export const addCanonTeamMember = async (teamId: string, userId: string) => {
  return prisma.canonTeamMember.upsert({
    where: { teamId_userId: { teamId, userId } },
    create: { teamId, userId },
    update: {},
  });
};

export const removeCanonTeamMember = async (teamId: string, userId: string) => {
  return prisma.canonTeamMember.delete({ where: { teamId_userId: { teamId, userId } } });
};
