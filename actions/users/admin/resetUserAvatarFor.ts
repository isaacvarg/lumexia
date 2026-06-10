'use server'

import prisma from "@/lib/prisma"
import { getUser } from "../getUser"

// Admin-only: reset a target user's avatar to the original (Discord) URL saved in
// their `originalImage` UserConfig the first time it was replaced. Mirrors
// resetUserAvatar but for another user.
export const resetUserAvatarFor = async (targetUserId: string) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may reset avatars")
  }

  const original = await prisma.userConfig.findFirst({
    where: { userId: targetUserId, name: 'originalImage' },
  })

  await prisma.user.update({
    where: { id: targetUserId },
    data: { image: original?.value ?? null },
  })
}
