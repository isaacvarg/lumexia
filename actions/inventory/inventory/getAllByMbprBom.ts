"use server"

import { getLotsByItem } from "@/actions/auxiliary/getLotsByItem"
import prisma from "@/lib/prisma"
import { bprStatuses } from "@/configs/staticRecords/bprStatuses"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import { ItemActiveMbpr } from "@/app/inventory/items/[name]/_actions/production/getActiveMbpr"

export const getAllInventoryByMbprBom = async (mbpr: NonNullable<ItemActiveMbpr>) => {
  const activeBatchSize = mbpr.BatchSize.find(bz => bz.recordStatusId === recordStatuses.active)

  if (!activeBatchSize) return []

  const { queued, stagingMaterials, compounding, completed, awaitingMaterials, draft } = bprStatuses

  const data = await Promise.all(mbpr.BillOfMaterial.map(async (line) => {

    const requiredQuantity = (line.concentration * 0.01) * activeBatchSize.quantity

    const lots = await getLotsByItem(line.itemId)

    const allocated = await prisma.bprBillOfMaterials.findMany({
      where: {
        bom: { itemId: line.itemId },
        bpr: {
          OR: [
            { bprStatusId: queued },
            { bprStatusId: stagingMaterials },
            { bprStatusId: compounding },
            { bprStatusId: completed },
            { bprStatusId: awaitingMaterials },
          ]
        }
      },
      include: {
        bpr: {
          include: {
            mbpr: { include: { producesItem: true } },
            status: true,
          }
        },
        bom: true,
        uom: true,
      }
    })

    const softAllocated = await prisma.bprBillOfMaterials.findMany({
      where: {
        bom: { itemId: line.itemId },
        bpr: { bprStatusId: draft },
      }
    })

    const purchases = await prisma.purchaseOrderItem.findMany({
      where: { itemId: line.itemId },
      orderBy: { purchaseOrders: { referenceCode: 'desc' } },
      include: {
        purchaseOrders: { include: { status: true } },
        purchaseOrderStatus: true,
      },
      take: 5,
    })

    const totalQuantityOnHand = lots.reduce(
      (acc: number, current) => acc + current.totalQuantityOnHand, 0
    )

    const totalQuantityAllocated = allocated.reduce(
      (acc: number, current) => acc + current.quantity, 0
    )

    const totalQuantitySoftAllocated = softAllocated.reduce(
      (acc: number, current) => acc + current.quantity, 0
    )

    const totalQuantityAvailable = totalQuantityOnHand - totalQuantityAllocated

    const totalQuantitySoftAvailability = totalQuantityOnHand - totalQuantityAllocated - totalQuantitySoftAllocated

    return {
      ...line,
      requiredQuantity,
      totalQuantityOnHand,
      totalQuantityAllocated,
      totalQuantitySoftAllocated,
      totalQuantityAvailable,
      totalQuantitySoftAvailability,
      allocated,
      purchases,
    }
  }))

  return data
}

export type MbprBomItemInventory = Awaited<ReturnType<typeof getAllInventoryByMbprBom>>[number]
