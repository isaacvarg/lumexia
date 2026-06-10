'use server'

import prisma from "@/lib/prisma"
import { getFileUrl } from "@/actions/files/getUrl"

// Fetches all users with their role assignments for the admin Manage Users table.
// Uploaded avatars are stored as bare object keys; resolve them to presigned URLs
// (mirroring getUser) so the table can render them directly.
export const getAllUsers = async () => {

  const users = await prisma.user.findMany({
    include: {
      UserRoleAssignment: {
        include: {
          userRole: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return Promise.all(users.map(async (user) => {
    let image = user.image
    if (image && !image.startsWith('http')) {
      image = await getFileUrl(process.env.S3_BUCKET_NAME!, image)
    }
    return { ...user, image }
  }))
}

export type UserWithRoles = Awaited<ReturnType<typeof getAllUsers>>[number]
