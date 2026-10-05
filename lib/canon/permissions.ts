import prisma from "@/lib/prisma";

// Permissions are stored in two tables (direct user grants and team grants);
// everything else should ask through these helpers.

export const canUser = async (userId: string, dataTypeId: string, capabilityId: string): Promise<boolean> => {
  const [direct, viaTeam] = await Promise.all([
    prisma.canonDataTypeUserPermission.count({
      where: { dataTypeId, capabilityId, userId },
    }),
    prisma.canonDataTypeTeamPermission.count({
      where: { dataTypeId, capabilityId, team: { members: { some: { userId } } } },
    }),
  ]);

  return direct + viaTeam > 0;
};

// Everyone holding a capability on a data type, deduplicated, e.g. to notify reviewers.
export const getGranteeIds = async (dataTypeId: string, capabilityId: string): Promise<string[]> => {
  const [direct, teams] = await Promise.all([
    prisma.canonDataTypeUserPermission.findMany({
      where: { dataTypeId, capabilityId },
      select: { userId: true },
    }),
    prisma.canonDataTypeTeamPermission.findMany({
      where: { dataTypeId, capabilityId },
      select: { team: { select: { members: { select: { userId: true } } } } },
    }),
  ]);

  const ids = new Set(direct.map((p) => p.userId));
  teams.forEach((p) => p.team.members.forEach((m) => ids.add(m.userId)));
  return Array.from(ids);
};
