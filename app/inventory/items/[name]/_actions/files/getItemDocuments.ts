'use server'

import prisma from "@/lib/prisma"
import { getItemDocumentStatus } from "@/lib/itemDocuments/queries"

// Requirement statuses for the Files tab, plus the item's lots so uploads can be attached to one
// (received lots carry their purchase order's supplier, used to prefill the upload form) and the
// suppliers the item has been ordered from, most recent first, to suggest for item-level documents.
export const getItemDocuments = async (itemId: string) => {
  const [status, lots, orders] = await Promise.all([
    getItemDocumentStatus(prisma, itemId),
    prisma.lot.findMany({
      where: { itemId },
      select: {
        id: true,
        lotNumber: true,
        createdAt: true,
        lotOrigin: {
          select: {
            originType: true,
            purchaseOrder: { select: { supplier: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { purchaseOrderItems: { some: { itemId } } },
      select: { createdAt: true, supplier: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const orderedFrom = new Map<string, { id: string; name: string; lastOrderedAt: Date }>()
  for (const o of orders) {
    if (!orderedFrom.has(o.supplier.id)) orderedFrom.set(o.supplier.id, { ...o.supplier, lastOrderedAt: o.createdAt })
  }

  const requirements = status?.requirements ?? []
  const fileTypes = await prisma.itemFileType.findMany({
    where: { id: { in: requirements.map((r) => r.requirement.fileTypeId) } },
    select: { id: true, name: true, abbreviaton: true, bgColor: true, textColor: true },
  })

  return {
    requirements,
    fileTypes,
    orderedFrom: Array.from(orderedFrom.values()),
    lots: lots.map((l) => ({
      id: l.id,
      lotNumber: l.lotNumber,
      createdAt: l.createdAt,
      originType: l.lotOrigin?.originType ?? null,
      supplier: l.lotOrigin?.purchaseOrder?.supplier ?? null,
    })),
  }
}

export type ItemDocuments = Awaited<ReturnType<typeof getItemDocuments>>
export type ItemDocumentLot = ItemDocuments["lots"][number]
