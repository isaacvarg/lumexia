'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"
import { assertNotLastAdmin } from "./setUserDisabled"

// Admin-only Danger Zone action: permanently deactivate an account by disabling
// it, revoking sessions, and unlinking OAuth accounts. We do NOT hard-delete the
// user because of the many non-cascade relations (POs, notes, etc.).
export const deactivateUserAccount = async (targetUserId: string) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may deactivate accounts")
  }

  if (targetUserId === admin.id) {
    throw new Error("You cannot deactivate your own account")
  }

  await assertNotLastAdmin(targetUserId)

  await prisma.user.update({
    where: { id: targetUserId },
    data: { disabled: true },
  })

  await prisma.session.deleteMany({ where: { userId: targetUserId } })
  await prisma.account.deleteMany({ where: { userId: targetUserId } })
}
