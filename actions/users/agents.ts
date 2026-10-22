'use server'

import prisma from "@/lib/prisma"
import { getUser } from "./getUser"
import { userKinds } from "@/lib/userKinds"

const assertAdmin = async () => {
  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may manage agents")
  }
}

const cleanProfile = (input: { name: string; description?: string | null }) => {
  const name = input.name.trim()
  if (!name) {
    throw new Error("An agent needs a name")
  }
  return { name, description: input.description?.trim() || null }
}

// Admin-only: an agent is a user that never signs in. It starts with no roles and no keys;
// the admin gives it roles and creates its keys from its user page.
export const createAgentUser = async (input: { name: string; description?: string | null }) => {
  await assertAdmin()

  const agent = await prisma.user.create({
    data: { ...cleanProfile(input), kind: userKinds.agent },
    select: { id: true },
  })

  return agent
}

export const updateAgentProfile = async (agentUserId: string, input: { name: string; description?: string | null }) => {
  await assertAdmin()
  await assertAgent(agentUserId)

  await prisma.user.update({
    where: { id: agentUserId },
    data: cleanProfile(input),
  })
}

// Pass null to go back to the bot mark.
export const setAgentAvatar = async (agentUserId: string, objectName: string | null) => {
  await assertAdmin()
  await assertAgent(agentUserId)

  await prisma.user.update({
    where: { id: agentUserId },
    data: { image: objectName },
  })
}

const assertAgent = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { kind: true } })
  if (user.kind !== userKinds.agent) {
    throw new Error("Not an agent user")
  }
}
