'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"
import { apiKeyScopes, ApiKeyScope, createApiKey, GrantableScope, isGrantable, listApiKeys, revokeApiKey as revokeKey, setApiKeyScopes } from "@/lib/apiKeys"
import { userKinds } from "@/lib/userKinds"

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

// Keys are created for the signed-in user, so agents act with that user's permissions.
export const createMyApiKey = async (input: ApiKeyInput) => {
  const user = await getUser()
  if ((input.grants ?? []).length > 0 && !user.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may create keys with more than read access")
  }

  return createKeyFor(user.id, input)
}

// Admin-only: agent users never sign in, so an admin creates their keys. Never for people or the system user.
export const createAgentApiKey = async (agentUserId: string, input: ApiKeyInput) => {
  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may create keys for agents")
  }

  const agent = await prisma.user.findUniqueOrThrow({ where: { id: agentUserId }, select: { kind: true, disabled: true } })
  if (agent.kind !== userKinds.agent) {
    throw new Error("Keys can only be created for agent users")
  }
  if (agent.disabled) {
    throw new Error("This agent is disabled")
  }

  return createKeyFor(agentUserId, input)
}

type ApiKeyInput = { name: string; expiry: ApiKeyExpiry; grants?: GrantableScope[] }

const createKeyFor = async (userId: string, input: ApiKeyInput) => {
  const grants = input.grants ?? []
  if (grants.some((scope) => !isGrantable(scope))) {
    throw new Error("Unknown access")
  }

  const name = input.name.trim()
  if (!name) {
    throw new Error("A key needs a name")
  }

  const days = EXPIRY_DAYS[input.expiry]
  const expiresAt = days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const scopes: ApiKeyScope[] = [apiKeyScopes.read, ...Array.from(new Set(grants))]
  return createApiKey(userId, { name, expiresAt, scopes })
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
