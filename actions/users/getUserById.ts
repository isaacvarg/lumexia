'use server'

import prisma from "@/lib/prisma"
import { getFileUrl } from "@/actions/files/getUrl"

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      UserRoleAssignment: {
        include: {
          userRole: true,
        },
      },
      accounts: {
        select: { provider: true },
      },
    },
  })
  if (!user) return null

  // Uploaded avatars are bare object keys (mirroring getUser); resolve them for display.
  let image = user.image
  if (image && !image.startsWith('http')) {
    image = await getFileUrl(process.env.S3_BUCKET_NAME!, image)
  }
  return { ...user, image }
}

export type UserWithRolesDetail = NonNullable<Awaited<ReturnType<typeof getUserById>>>
