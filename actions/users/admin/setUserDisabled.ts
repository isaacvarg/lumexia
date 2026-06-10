'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"
import { userRoles } from "@/configs/staticRecords/userRoles"

// Admin-only: enable/disable a user. Disabling also revokes their active sessions.
// Guards against disabling yourself or the last remaining system admin.
export const setUserDisabled = async (targetUserId: string, disabled: boolean) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may change account status")
  }

  if (disabled) {
    if (targetUserId === admin.id) {
      throw new Error("You cannot disable your own account")
    }
    await assertNotLastAdmin(targetUserId)
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { disabled },
  })

  if (disabled) {
    await prisma.session.deleteMany({ where: { userId: targetUserId } })
  }
}

// Throws if the target is a system admin and removing/disabling them would leave
// no enabled system admins.
export const assertNotLastAdmin = async (targetUserId: string) => {
  const isTargetAdmin = await prisma.userRoleAssignment.findFirst({
    where: { userId: targetUserId, userRoleId: userRoles.systemAdmin },
  })
  if (!isTargetAdmin) return

  const otherEnabledAdmins = await prisma.userRoleAssignment.count({
    where: {
      userRoleId: userRoles.systemAdmin,
      userId: { not: targetUserId },
      user: { disabled: false },
    },
  })

  if (otherEnabledAdmins === 0) {
    throw new Error("Cannot disable the last remaining system admin")
  }
}
