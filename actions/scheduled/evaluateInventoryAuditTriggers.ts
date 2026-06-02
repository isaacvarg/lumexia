"use server"

import prisma from "@/lib/prisma"
import { getLotsByItem } from "@/actions/auxiliary/getLotsByItem"
import { createAuditRequest } from "@/actions/inventory/auditRequests/create"
import { auditRequestStatuses } from "@/configs/staticRecords/auditRequestStatuses"
import { auditRequestNoteTypes } from "@/configs/staticRecords/auditRequestNoteTypes"
import { procurementTypes } from "@/configs/staticRecords/procurementTypes"
import { InterimAuditRequestNote } from "@/app/production/planning/[bprReferenceCode]/_components/bom/AuditRequest"
import { getInventoryAuditConfig } from "@/actions/app/configs/getInventoryAuditConfig"

export const evaluateInventoryAuditTriggers = async () => {
  const systemUser = await prisma.user.findFirst({ where: { name: 'Lumexia' } })
  if (!systemUser) {
    console.error('[evaluateInventoryAuditTriggers] Lumexia system user not found; aborting.')
    return
  }

  const config = await getInventoryAuditConfig()
  if (!config.lowOnHand.enabled && !config.bprUsage.enabled && !config.negativeStock.enabled) {
    return
  }

  const items = await prisma.item.findMany({
    where: {
      procurementTypeId: procurementTypes.purchased,
      itemTypeId: { in: config.enabledItemTypeIds },
    },
    select: { id: true, name: true },
  })

  for (const item of items) {
    try {
      const openAudit = await prisma.auditRequest.findFirst({
        where: { itemId: item.id, statusId: auditRequestStatuses.open },
        select: { id: true },
      })
      if (openAudit) continue

      const reasons: string[] = []

      const lots = await getLotsByItem(item.id)

      if (config.lowOnHand.enabled) {
        const activeRuleCount = await prisma.reorderingRule.count({
          where: { itemId: item.id, enabled: true },
        })

        if (activeRuleCount === 0) {
          for (const lot of lots) {
            if (lot.initialQuantity > 0 && lot.totalQuantityOnHand < config.lowOnHand.ratio * lot.initialQuantity) {
              const pct = ((lot.totalQuantityOnHand / lot.initialQuantity) * 100).toFixed(1)
              reasons.push(`Lot ${lot.lotNumber} on-hand ${lot.totalQuantityOnHand}/${lot.initialQuantity} (${pct}%) and no active reordering rule.`)
            }
          }
        }
      }

      if (config.bprUsage.enabled) {
        const bprs = await prisma.bprBillOfMaterials.findMany({
          where: { bom: { itemId: item.id } },
          distinct: ['bprId'],
          select: { bprId: true },
        })
        if (bprs.length > config.bprUsage.threshold) {
          reasons.push(`Item is consumed by ${bprs.length} BPRs (>${config.bprUsage.threshold}).`)
        }
      }

      if (config.negativeStock.enabled) {
        for (const lot of lots) {
          if (lot.totalQuantityOnHand < 0) {
            reasons.push(`Lot ${lot.lotNumber} has negative on-hand (${lot.totalQuantityOnHand}).`)
          }
        }
      }

      if (reasons.length === 0) continue

      const note: InterimAuditRequestNote = {
        requestNoteTypeId: auditRequestNoteTypes.automated,
        requestNoteType: { bgColor: '', textColor: '' },
        content: reasons.join('\n'),
      }

      await createAuditRequest([note], item.id, systemUser.id)
    } catch (err) {
      console.error(`[evaluateInventoryAuditTriggers] failed for item ${item.id}:`, err)
    }
  }
}
