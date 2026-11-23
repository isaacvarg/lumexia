"use server"

import prisma from "@/lib/prisma"
import { nextSku, normalizeSkuPrefix } from "@/lib/items/sku"

type GenerateSkuResult = { success: true; sku: string } | { success: false; error: string }

// The next free reference code for an item type, from the SKU prefix set in inventory settings.
export const generateSku = async (itemTypeId: string): Promise<GenerateSkuResult> => {
  if (!itemTypeId) return { success: false, error: "Choose an item type first." }

  const itemType = await prisma.itemType.findUnique({
    where: { id: itemTypeId },
    select: { name: true, skuPrefix: true },
  })
  if (!itemType) return { success: false, error: "That item type no longer exists." }

  const prefix = normalizeSkuPrefix(itemType.skuPrefix)
  if (!prefix) {
    return { success: false, error: `'${itemType.name}' has no SKU prefix. Set one in Settings > Inventory > Item Types.` }
  }

  // Codes are matched against every item, not just this type, so the result is unique.
  const candidates = await prisma.item.findMany({
    where: { referenceCode: { startsWith: prefix, mode: "insensitive" } },
    select: { referenceCode: true },
  })

  return { success: true, sku: nextSku(prefix, candidates.map((c) => c.referenceCode)) }
}
