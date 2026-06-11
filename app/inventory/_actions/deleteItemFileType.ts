'use server'

import prisma from "@/lib/prisma"

export const deleteItemFileType = async (id: string) => {
  try {
    await prisma.itemFileType.delete({ where: { id } })
    return { success: true as const }
  } catch {
    return {
      success: false as const,
      error: "This file type can't be deleted because existing records still reference it.",
    }
  }
}
