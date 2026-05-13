"use server"

import prisma from "@/lib/prisma"
import { getInventory } from "@/actions/inventory/getInventory"
import { createAuditRequest } from "@/actions/inventory/auditRequests/create"
import { createPurchasingRequestForRule } from "@/actions/purchasing/requests/create"
import { auditRequestStatuses } from "@/configs/staticRecords/auditRequestStatuses"
import { requestStatuses } from "@/configs/staticRecords/requestStatuses"

const purchasingRequestTerminalStatusIds = [
  requestStatuses.delivered,
  requestStatuses.requestCancelledDuplicateRequest,
]

export const evaluateReorderingRules = async () => {
  const rules = await prisma.reorderingRule.findMany({
    where: { enabled: true },
    include: { item: true },
  })

  if (rules.length === 0) return

  const systemUser = await prisma.user.findFirst({ where: { name: 'Lumexia' } })
  if (!systemUser) {
    console.error('[evaluateReorderingRules] Lumexia system user not found; aborting.')
    return
  }

  for (const rule of rules) {
    try {
      const inventory = await getInventory(rule.itemId)
      const position = inventory.totalQuantityAvailable + inventory.totalQuantityOnOrder
      const triggerAt = rule.thresholdQuantity * (1 + rule.bufferPercent / 100)

      if (position >= triggerAt) continue

      if (rule.createAuditRequest) {
        const openAudit = await prisma.auditRequest.findFirst({
          where: { itemId: rule.itemId, statusId: auditRequestStatuses.open },
          select: { id: true },
        })
        if (!openAudit) {
          await createAuditRequest([], rule.itemId, systemUser.id)
        }
      }
      if (rule.createPurchasingRequest) {
        const openPurchasing = await prisma.purchasingRequest.findFirst({
          where: {
            itemId: rule.itemId,
            statusId: { notIn: purchasingRequestTerminalStatusIds },
          },
          select: { id: true },
        })
        if (!openPurchasing) {
          await createPurchasingRequestForRule(rule.itemId, systemUser.id, inventory)
        }
      }
    } catch (err) {
      console.error(`[evaluateReorderingRules] failed for rule ${rule.id}:`, err)
    }
  }
}
