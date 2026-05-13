"use server"

import prisma from "@/lib/prisma"
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses"

export const getOnOrderQuantity = async (itemId: string): Promise<number> => {
  const items = await prisma.purchaseOrderItem.findMany({
    where: {
      itemId,
      purchaseOrderStatusId: {
        notIn: [purchaseOrderStatuses.received],
      },
    },
    select: {
      quantity: true,
    },
  })

  return items.reduce((sum, item) => sum + item.quantity, 0)
}
