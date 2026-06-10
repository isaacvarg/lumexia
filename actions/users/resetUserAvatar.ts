'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "./getUserId"
import { getUserConfig } from "./getUserConfig"

// Restores the avatar to the original Discord URL saved in UserConfig the first
// time it was replaced. Falls back to null if no original was ever stored.
export const resetUserAvatar = async () => {

  const userId = await getUserId()
  if (!userId) {
    throw new Error("userId not found")
  }

  const original = await getUserConfig('originalImage')

  await prisma.user.update({
    where: { id: userId },
    data: { image: original?.value ?? null },
  })
}
