"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ConfigUpdate = { id: string; value: string }

export const updateManyConfigs = async (updates: ConfigUpdate[], revalidate?: string) => {
  await prisma.$transaction(
    updates.map((u) =>
      prisma.config.update({ where: { id: u.id }, data: { value: u.value } })
    )
  )

  if (revalidate) {
    revalidatePath(revalidate)
  }
}
