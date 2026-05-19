"use server"

import { requestStatuses } from "@/configs/staticRecords/requestStatuses"
import prisma from "@/lib/prisma"

const { delivered, requestCancelledDuplicateRequest, discontinuedIngredient } = requestStatuses

export const getPurchasingRequestsForPlanning = async (itemId: string) => {


  const response = await prisma.purchasingRequest.findMany({
    where: {
      itemId,
      statusId: {
        notIn: [delivered, requestCancelledDuplicateRequest, discontinuedIngredient]
      }
    },
    include: {
      status: true,
      pos: {
        include: {
          po: {
            include: {
              purchaseOrderItems: {
                include: {
                  details: true,
                  uom: true,
                }
              }
            }
          }
        }
      }
    }
  })

  return response
}

export type PurchasingRequestForPlanning = Awaited<ReturnType<typeof getPurchasingRequestsForPlanning>>[number]
