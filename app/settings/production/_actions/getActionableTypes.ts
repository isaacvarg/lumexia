"use server"

import prisma from "@/lib/prisma"

export const getActionableTypes = async () => {
  return prisma.stepActionableType.findMany({
    include: { userRole: true },
    orderBy: { name: 'asc' },
  })
}

export type ActionableTypeRow = Awaited<ReturnType<typeof getActionableTypes>>[number]
