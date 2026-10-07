'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"
import { apiKeyScopes, createApiKey, listApiKeys, revokeApiKey as revokeKey, setApiKeyScopes } from "@/lib/apiKeys"

const EXPIRY_DAYS = { never: null, "30": 30, "90": 90, "365": 365 } as const

export type ApiKeyExpiry = keyof typeof EXPIRY_DAYS

export const getMyApiKeys = async () => {
  const user = await getUser()
  return listApiKeys(user.id)
}

// Admin-only: another user's keys, for review and revocation.
export const getUserApiKeys = async (targetUserId: string) => {
  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may view other users' API keys")
  }

  return listApiKeys(targetUserId)
}

// Keys are always created for the signed-in user, so agents act with that user's permissions.
// Only system admins may give a key write access (filing documents over MCP).
export const createMyApiKey = async (input: { name: string; expiry: ApiKeyExpiry; allowWrite?: boolean }) => {
  const user = await getUser()

  if (input.allowWrite && !user.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may create keys with write access")
  }

  const name = input.name.trim()
  if (!name) {
    throw new Error("A key needs a name")
  }

  const days = EXPIRY_DAYS[input.expiry]
  const expiresAt = days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const scopes = input.allowWrite ? [apiKeyScopes.read, apiKeyScopes.write] : [apiKeyScopes.read]
  return createApiKey(user.id, { name, expiresAt, scopes })
}

// Admin-only: turn write access on or off for any user's key, e.g. for whoever files documents.
export const setApiKeyWriteAccess = async (apiKeyId: string, allowWrite: boolean) => {
  const user = await getUser()
  if (!user.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may change a key's access")
  }

  const scopes = allowWrite ? [apiKeyScopes.read, apiKeyScopes.write] : [apiKeyScopes.read]
  await setApiKeyScopes(apiKeyId, scopes)
}

// Owners can revoke their own keys; system admins can revoke anyone's.
export const revokeApiKey = async (apiKeyId: string) => {
  const user = await getUser()

  const apiKey = await prisma.apiKey.findUniqueOrThrow({
    where: { id: apiKeyId },
    select: { userId: true },
  })

  if (apiKey.userId !== user.id && !user.roles.isSystemAdmin) {
    throw new Error("Forbidden: you can only revoke your own API keys")
  }

  await revokeKey(apiKeyId)
}
