'use server'

import prisma from "@/lib/prisma"
import { getUser } from "./getUser"

// Admin-only: sets a target user's role assignments to exactly `roleIds`,
// diffing against existing assignments so the operation is idempotent.
export const updateUserRoles = async (targetUserId: string, roleIds: string[]) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may modify user roles")
  }

  const existing = await prisma.userRoleAssignment.findMany({
    where: { userId: targetUserId },
  })

  const existingRoleIds = new Set(existing.map(a => a.userRoleId))
  const selectedRoleIds = new Set(roleIds)

  const toAdd = roleIds.filter(id => !existingRoleIds.has(id))
  const toRemove = existing.filter(a => !selectedRoleIds.has(a.userRoleId))

  if (toRemove.length > 0) {
    await prisma.userRoleAssignment.deleteMany({
      where: { id: { in: toRemove.map(a => a.id) } },
    })
  }

  if (toAdd.length > 0) {
    await prisma.userRoleAssignment.createMany({
      data: toAdd.map(userRoleId => ({ userId: targetUserId, userRoleId })),
    })
  }
}
