"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

export type ReorderingRuleInput = {
  thresholdQuantity: number
  bufferPercent: number
  createAuditRequest: boolean
  createPurchasingRequest: boolean
  enabled: boolean
}

export const upsertReorderingRule = async (itemId: string, input: ReorderingRuleInput) => {
  const rule = await prisma.reorderingRule.upsert({
    where: { itemId },
    update: input,
    create: {
      itemId,
      ...input,
    },
  })

  await createActivityLog("upsertReorderingRule", "reorderingRule", rule.id, {
    context: `Reordering rule saved (threshold ${rule.thresholdQuantity}, buffer ${rule.bufferPercent}%)`,
  })

  return rule
}
