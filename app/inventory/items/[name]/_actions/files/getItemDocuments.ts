'use server'

import prisma from "@/lib/prisma"
import { getItemDocumentStatus } from "@/lib/itemDocuments/queries"

// Requirement statuses for the Files tab, plus the item's lots so uploads can be attached to one
// (received lots carry their purchase order's supplier, used to prefill the upload form).
export const getItemDocuments = async (itemId: string) => {
  const [status, lots] = await Promise.all([
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
  ])

  const requirements = status?.requirements ?? []
  const fileTypes = await prisma.itemFileType.findMany({
    where: { id: { in: requirements.map((r) => r.requirement.fileTypeId) } },
    select: { id: true, name: true, abbreviaton: true, bgColor: true, textColor: true },
  })

  return {
    requirements,
    fileTypes,
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
