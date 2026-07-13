"use server"

import prisma from "@/lib/prisma"
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

// Cancelling a PO marks it Cancelled + archived and cancels its open line items.
// Received line items keep their "Received" status so receipt/inventory history
// stays intact. Cancelled items are excluded from on-order quantities (see
// getOnOrderQuantity / getOnOrderContributions).
export const cancelPurchaseOrder = async (purchaseOrderId: string) => {
  await prisma.$transaction([
    prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        statusId: purchaseOrderStatuses.cancelled,
        recordStatusId: recordStatuses.archived,
      },
    }),
    prisma.purchaseOrderItem.updateMany({
      where: {
        purchaseOrderId,
        purchaseOrderStatusId: { not: purchaseOrderStatuses.received },
      },
      data: { purchaseOrderStatusId: purchaseOrderStatuses.cancelled },
    }),
  ])

  await createActivityLog('Cancelled PO', 'purchaseOrder', purchaseOrderId, {
    context: 'The PO was cancelled.',
  })
}
