'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"
import { apiKeyScopes, ApiKeyScope, createApiKey, GrantableScope, isGrantable, listApiKeys, revokeApiKey as revokeKey, setApiKeyScopes } from "@/lib/apiKeys"

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
export const createMyApiKey = async (input: { name: string; expiry: ApiKeyExpiry; grants?: GrantableScope[] }) => {
  const user = await getUser()
  const grants = input.grants ?? []

  if (grants.some((scope) => !isGrantable(scope))) {
    throw new Error("Unknown access")
  }
  if (grants.length > 0 && !user.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may create keys with more than read access")
  }

  const name = input.name.trim()
  if (!name) {
    throw new Error("A key needs a name")
  }

  const days = EXPIRY_DAYS[input.expiry]
  const expiresAt = days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const scopes: ApiKeyScope[] = [apiKeyScopes.read, ...Array.from(new Set(grants))]
  return createApiKey(user.id, { name, expiresAt, scopes })
}

// Admin-only: turn one kind of access on or off for any user's key.
export const setApiKeyAccess = async (apiKeyId: string, scope: GrantableScope, enabled: boolean) => {
  const user = await getUser()
  if (!isGrantable(scope)) {
    throw new Error("Unknown access")
  }
  if (!user.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may change a key's access")
  }

  const { scopes } = await prisma.apiKey.findUniqueOrThrow({ where: { id: apiKeyId }, select: { scopes: true } })
  const next = scopes.filter((s) => s !== scope)
  if (enabled) next.push(scope)
  await setApiKeyScopes(apiKeyId, next as ApiKeyScope[])
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
