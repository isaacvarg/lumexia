'use server'

import prisma from "@/lib/prisma"
import { getUser } from "./getUser"
import { createLinkCode, IdentityChannel, identityChannels, listLinkedIdentities } from "@/lib/linkedIdentities"

export const getMyLinkedIdentities = async () => {
  const user = await getUser()
  return listLinkedIdentities(user.id)
}

// Admin-only: another user's linked identities, for review and unlinking.
export const getUserLinkedIdentities = async (targetUserId: string) => {
  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may view other users' linked accounts")
  }

  return listLinkedIdentities(targetUserId)
}

// Codes are always for the signed-in user: sending one to the agent proves the sender is them.
export const createMyLinkCode = async (channel: IdentityChannel) => {
  const user = await getUser()
  if (!Object.values(identityChannels).includes(channel)) {
    throw new Error("Unknown channel")
  }

  return createLinkCode(user.id, channel)
}

// Owners can unlink their own identities; system admins can unlink anyone's.
export const unlinkIdentity = async (linkedIdentityId: string) => {
  const user = await getUser()

  const identity = await prisma.linkedIdentity.findUniqueOrThrow({
    where: { id: linkedIdentityId },
    select: { userId: true },
  })

  if (identity.userId !== user.id && !user.roles.isSystemAdmin) {
    throw new Error("Forbidden: you can only unlink your own accounts")
  }

  await prisma.linkedIdentity.delete({ where: { id: linkedIdentityId } })
}
