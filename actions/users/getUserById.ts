'use server'

import prisma from "@/lib/prisma"

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
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
}

export type UserWithRolesDetail = NonNullable<Awaited<ReturnType<typeof getUserById>>>
