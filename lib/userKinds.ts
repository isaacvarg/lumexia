import prisma from "@/lib/prisma";

// What a user row stands for. Only humans sign in (Discord); agents act through API keys an admin
// creates for them, and the system user (Lumexia) is the actor for scheduled jobs and automation.
export const userKinds = {
  human: "human",
  agent: "agent",
  system: "system",
} as const;

export type UserKind = (typeof userKinds)[keyof typeof userKinds];

// Matched by kind, not by static id: legacy instances seeded Lumexia with a random id.
export const getSystemUser = () =>
  prisma.user.findFirst({ where: { kind: userKinds.system }, orderBy: { createdAt: "asc" } });
