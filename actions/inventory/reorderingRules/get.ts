"use server"

import prisma from "@/lib/prisma"

export const getReorderingRule = async (itemId: string) => {
  return prisma.reorderingRule.findUnique({ where: { itemId } })
}

export type ReorderingRule = Awaited<ReturnType<typeof getReorderingRule>>
