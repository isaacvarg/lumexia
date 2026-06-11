'use server'

import prisma from "@/lib/prisma"

export const deleteItemType = async (id: string) => {
  try {
    await prisma.itemType.delete({ where: { id } })
    return { success: true as const }
  } catch {
    return {
      success: false as const,
      error: "This item type can't be deleted because existing records still reference it.",
    }
  }
}
