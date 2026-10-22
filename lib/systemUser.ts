import prisma from "@/lib/prisma";
import { userKinds } from "@/lib/userKinds";

// Matched by kind, not by static id: legacy instances seeded Lumexia with a random id.
export const getSystemUser = () =>
  prisma.user.findFirst({ where: { kind: userKinds.system }, orderBy: { createdAt: "asc" } });

// Admin actions on users refuse the system user: scheduled jobs depend on it staying as seeded.
export const assertNotSystemUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { kind: true } });
  if (user?.kind === userKinds.system) {
    throw new Error("The system user can't be changed");
  }
};
