"use server"

import { getLotsByItem } from "@/actions/auxiliary/getLotsByItem"
import { bprStatuses } from "@/configs/staticRecords/bprStatuses";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import prisma from "@/lib/prisma";

// current inventory (now)

export const getInventory = async (itemId: string) => {


  const lots = await getLotsByItem(itemId);
  const { queued, stagingMaterials, compounding, completed, awaitingMaterials, draft, allocatingMaterials, verifyingBomFulfillment } = bprStatuses;


  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      recordStatusId: {
        not: recordStatuses.archived
      }
    },
  });

  // this is the amount neded for batches that do not yet have everything allocated
  const needed = await prisma.bprBillOfMaterials.findMany({
    where: {
      bom: {
        itemId,
      },
      bpr: {
        OR: [
          { bprStatusId: draft },
          { bprStatusId: allocatingMaterials },
          { bprStatusId: verifyingBomFulfillment },
        ]
      }
    },
    include: {
      bpr: {
        include: {
          mbpr: {
            include: {
              producesItem: true,
            }
          },
          status: true
        }
      },
      bom: true,
      uom: true,
    }

  })


  const allocated = await prisma.bprBillOfMaterials.findMany({
    where: {
      bom: {
        itemId,
      },
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
          mbpr: {
            include: {
              producesItem: true,
            }
          },
          status: true
        }
      },
      bom: true,
      uom: true,
    }
  })

  const softAllocated = await prisma.bprBillOfMaterials.findMany({
    where: {
      bom: {
        itemId,
      },
      bpr: { bprStatusId: draft },
    }
  })


  const purchases = await prisma.purchaseOrderItem.findMany({
    where: {
      itemId,
    },
    orderBy: {
      purchaseOrders: {
        referenceCode: 'desc',
      },
    },
    include: {
      purchaseOrders: {
        include: {
          status: true
        }
      },
      purchaseOrderStatus: true
    },
    take: 5
  })

  const auditRequests = await prisma.auditRequest.findMany({
    where: {
      itemId,
    },
    include: {
      status: true,
      inventoryAudit: {
        include: {
          user: true
        }
      },
      notes: {
        include: {
          noteType: true
        }
      }
    }
  })

  const totalOnHand = lots.reduce(
    (accumulator: number, current: any) => accumulator + current.totalQuantityOnHand, 0
  );

  const totalQuantityAllocated = allocated.reduce((accumulator: number, current: any) => accumulator + current.quantity, 0)

  const totalQuantitySoftAllocated = softAllocated.reduce((accumulator: number, current: any) => accumulator + current.quantity, 0)

  const totalQuantityAvailable = totalOnHand - totalQuantityAllocated;

  const totalQuantitySoftAvailability = totalOnHand - totalQuantityAllocated - totalQuantitySoftAllocated;

  const totalQuantityNeeded = needed.reduce((accumulator: number, current: typeof needed[number]) => accumulator + current.quantity, 0)

  return {
    ...item,
    totalQuantityOnHand: totalOnHand,
    allocated,
    needed,
    auditRequests,
    totalQuantityAllocated,
    totalQuantitySoftAllocated,
    totalQuantityAvailable,
    totalQuantitySoftAvailability,
    purchases,
    totalQuantityNeeded,
  }
}

export type ItemInventory = Awaited<ReturnType<typeof getInventory>>












