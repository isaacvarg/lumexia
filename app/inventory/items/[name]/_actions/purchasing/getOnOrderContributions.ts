"use server"

import prisma from "@/lib/prisma"
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses"

export const getOnOrderContributions = async (itemId: string) => {
  const poItems = await prisma.purchaseOrderItem.findMany({
    where: {
      itemId,
      purchaseOrderStatusId: {
        notIn: [purchaseOrderStatuses.received],
      },
    },
    include: {
      uom: true,
      purchaseOrderStatus: true,
      purchaseOrders: {
        include: {
          status: true,
          supplier: true,
          RequestPurchaseOrder: {
            include: {
              request: {
                select: {
                  id: true,
                  referenceCode: true,
                  expectedDateStart: true,
                  expectedDateEnd: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return poItems.map((line) => {
    const request = line.purchaseOrders.RequestPurchaseOrder[0]?.request ?? null

    return {
      poItemId: line.id,
      poId: line.purchaseOrders.id,
      poReferenceCode: line.purchaseOrders.referenceCode,
      supplierName: line.purchaseOrders.supplier.name,
      statusName: line.purchaseOrderStatus.name,
      quantity: line.quantity,
      uomAbbreviation: line.uom.abbreviation,
      request,
    }
  })
}

export type OnOrderContribution = Awaited<ReturnType<typeof getOnOrderContributions>>[number]
