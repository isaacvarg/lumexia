import { createHash, randomBytes } from "crypto";
import prisma from "@/lib/prisma";

// Keys let agents (Claude Code, Hermes) call Lumexia as a specific user over the MCP endpoint.
// Only a SHA-256 hash is stored; keys are 32 random bytes, so a slow hash adds nothing.

export const apiKeyScopes = {
  read: "read",
  write: "write",
  // act for users who linked a chat identity (e.g. WhatsApp) to their account; see lib/linkedIdentities.ts
  delegate: "delegate",
} as const;

export type ApiKeyScope = (typeof apiKeyScopes)[keyof typeof apiKeyScopes];

const KEY_PREFIX = "lmx_";
const DISPLAY_PREFIX_LENGTH = KEY_PREFIX.length + 8;
const LAST_USED_THROTTLE_MS = 60_000;

const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

// Returns the plaintext key; this is the only time it is ever available.
export const createApiKey = async (
  userId: string,
  input: { name: string; scopes?: ApiKeyScope[]; expiresAt?: Date | null },
) => {
  const key = KEY_PREFIX + randomBytes(32).toString("base64url");

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: input.name.trim(),
      prefix: key.slice(0, DISPLAY_PREFIX_LENGTH),
      keyHash: hashKey(key),
      scopes: input.scopes ?? [apiKeyScopes.read],
      expiresAt: input.expiresAt ?? null,
    },
    select: { id: true, name: true, prefix: true, scopes: true, expiresAt: true, createdAt: true },
  });

  return { apiKey, key };
};

// Resolves an "Authorization: Bearer lmx_..." header to its user, or null if the key is unusable.
export const authenticateApiKey = async (authorization: string | null) => {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match || !match[1].startsWith(KEY_PREFIX)) return null;

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashKey(match[1]) },
    include: { user: { select: { id: true, name: true, email: true, disabled: true } } },
  });

  const now = new Date();
  if (!apiKey || apiKey.revokedAt || apiKey.user.disabled) return null;
  if (apiKey.expiresAt && apiKey.expiresAt <= now) return null;

  if (!apiKey.lastUsedAt || now.getTime() - apiKey.lastUsedAt.getTime() > LAST_USED_THROTTLE_MS) {
    await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: now } });
  }

  const { disabled, ...user } = apiKey.user;
  return { keyId: apiKey.id, user, scopes: apiKey.scopes as ApiKeyScope[] };
};

export type ApiKeyAuth = NonNullable<Awaited<ReturnType<typeof authenticateApiKey>>>;

export const listApiKeys = async (userId: string) => {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      lastUsedAt: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
    },
    orderBy: [{ revokedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
  });
};

export type ApiKeyListing = Awaited<ReturnType<typeof listApiKeys>>[number];

export const setApiKeyScopes = async (apiKeyId: string, scopes: ApiKeyScope[]) => {
  return prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { scopes },
    select: { id: true, userId: true, scopes: true },
  });
};

// Revocation is soft so the key's history (who, when, last used) stays visible.
export const revokeApiKey = async (apiKeyId: string) => {
  return prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { revokedAt: new Date() },
    select: { id: true, userId: true, revokedAt: true },
  });
};
