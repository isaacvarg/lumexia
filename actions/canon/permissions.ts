"use server";

import prisma from "@/lib/prisma";

type Grant = { dataTypeId: string; capabilityId: string };

export const grantCanonUserPermission = async (input: Grant & { userId: string }) => {
  return prisma.canonDataTypeUserPermission.upsert({
    where: { dataTypeId_capabilityId_userId: input },
    create: input,
    update: {},
  });
};

export const grantCanonTeamPermission = async (input: Grant & { teamId: string }) => {
  return prisma.canonDataTypeTeamPermission.upsert({
    where: { dataTypeId_capabilityId_teamId: input },
    create: input,
    update: {},
  });
};

export const revokeCanonUserPermission = async (id: string) => {
  return prisma.canonDataTypeUserPermission.delete({ where: { id } });
};

export const revokeCanonTeamPermission = async (id: string) => {
  return prisma.canonDataTypeTeamPermission.delete({ where: { id } });
};
