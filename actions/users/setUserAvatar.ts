'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "./getUserId"
import { getUserConfig } from "./getUserConfig"
import { updateUserConfig } from "./updateUserConfig"
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups"

// Replaces the user's avatar with an uploaded RustFS object key. The first time
// a user replaces their Discord avatar we stash the original URL in a UserConfig
// so it can be restored later (see resetUserAvatar).
export const setUserAvatar = async (objectName: string) => {

  const userId = await getUserId()
  if (!userId) {
    throw new Error("userId not found")
  }

  if (!objectName) {
    throw new Error("objectName is required")
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { image: true },
  })

  // Preserve the original Discord avatar once, on first replacement. Uploaded
  // avatars are stored as bare object keys, so only http(s) URLs are "original".
  const existingOriginal = await getUserConfig('originalImage')
  if (!existingOriginal && user.image && user.image.startsWith('http')) {
    await updateUserConfig('originalImage', user.image, userConfigGroups.general)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { image: objectName },
  })
}
