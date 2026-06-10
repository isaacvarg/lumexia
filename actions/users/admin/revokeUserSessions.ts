'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"

// Admin-only: force sign-out by deleting the target user's active sessions.
export const revokeUserSessions = async (targetUserId: string) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may revoke sessions")
  }

  await prisma.session.deleteMany({ where: { userId: targetUserId } })
}
