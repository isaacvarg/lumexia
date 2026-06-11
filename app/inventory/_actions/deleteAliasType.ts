'use server'

import prisma from "@/lib/prisma"

export const deleteAliasType = async (id: string) => {
  try {
    await prisma.aliasType.delete({ where: { id } })
    return { success: true as const }
  } catch {
    return {
      success: false as const,
      error: "This alias type can't be deleted because existing records still reference it.",
    }
  }
}
