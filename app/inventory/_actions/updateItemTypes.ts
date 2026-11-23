'use server'

import { ItemType } from "@/actions/inventory/itemTypes/getAll"
import prisma from "@/lib/prisma"
import { normalizeSkuPrefix, skuPrefixError } from "@/lib/items/sku"

type UpdateItemTypesResult = { success: true } | { success: false; error: string }

export const updateItemTypes = async (itemTypes: ItemType[]): Promise<UpdateItemTypesResult> => {

  const prefixes = itemTypes.map((it) => ({ name: it.name, prefix: normalizeSkuPrefix(it.skuPrefix) }))

  for (const { name, prefix } of prefixes) {
    const error = skuPrefixError(prefix)
    if (error) return { success: false, error: `${name}: ${error}` }
  }

  const seen = new Map<string, string>()
  for (const { name, prefix } of prefixes) {
    if (!prefix) continue
    const other = seen.get(prefix)
    if (other) return { success: false, error: `${other} and ${name} both use the SKU prefix ${prefix}.` }
    seen.set(prefix, name)
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < itemTypes.length; i++) {
      const it = itemTypes[i]
      await tx.itemType.update({
        where: { id: it.id },
        data: {
          name: it.name,
          skuPrefix: prefixes[i].prefix || null,
        },
      })

      // Older item types may have no config row; their name and prefix still save.
      if (!it.config) continue

      await tx.itemTypeConfig.update({
        where: { id: it.config.id },
        data: {
          isPricingExaminationTriggerEnabled: it.config.isPricingExaminationTriggerEnabled,
        },
      })
    }
  })

  return { success: true }
}
