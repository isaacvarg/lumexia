// What a user row stands for. Only humans sign in (Discord); agents act through API keys an admin
// creates for them, and the system user (Lumexia) is the actor for scheduled jobs and automation.
// Safe for client components; the database helpers live in lib/systemUser.ts.
export const userKinds = {
  human: "human",
  agent: "agent",
  system: "system",
} as const;

export type UserKind = (typeof userKinds)[keyof typeof userKinds];
