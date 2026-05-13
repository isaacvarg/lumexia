"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

export const deleteReorderingRule = async (itemId: string) => {
  const rule = await prisma.reorderingRule.findUnique({ where: { itemId } })
  if (!rule) return

  await prisma.reorderingRule.delete({ where: { itemId } })

  await createActivityLog("deleteReorderingRule", "reorderingRule", rule.id, {
    context: `Reordering rule removed`,
  })
}
