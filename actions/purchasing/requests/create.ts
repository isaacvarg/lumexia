"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { DateTime } from "luxon";
import { getUserId } from "@/actions/users/getUserId";
import { BprBomItemInventory } from "@/actions/inventory/inventory/getAllByBom";
import { Inventory } from "@/actions/inventory/getInventory";
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses";
import { requestStatuses } from "@/configs/staticRecords/requestStatuses";
import { requestPriorities } from "@/configs/staticRecords/requestPriorities";

export const createRequest = async (material: BprBomItemInventory, priorityId: string, wasOverridden: boolean) => {


  const requestingUserId = await getUserId()
  const allocatedBprIds = material.allocated.map((bprBom) => bprBom.bpr.id);
  const pendingPoIds = material.purchases.filter((po) => po.purchaseOrderStatusId !== purchaseOrderStatuses.received).map((po) => po.id)
  const week = DateTime.now().toFormat("WW")

  const purchasingRequest = await prisma.purchasingRequest.create({
    data: {
      statusId: '226db3a6-2756-4a5d-a6c5-b741339baeea',
      itemId: material.bom.itemId,
      title: `${material.bom.item.name} <Week ${week}>`,
      priorityId,
      requestingUserId,

    }
  });

  const snapshot = await prisma.requestInventorySnapshot.create({
    data: {
      requestId: purchasingRequest.id,
      objectName: '',
      onHandQuantity: material.totalQuantityOnHand,
      allocatedQuantity: material.totalQuantityAllocated,
      availableQuantity: material.totalQuantityAvailable,
      allocatedBprIds,
      pendingPoIds,
      warningOverridden: wasOverridden,
      warningShown: wasOverridden,
    }
  });


  await createActivityLog("createPurchasingRequest", 'requestId', purchasingRequest.id, { context: `Request made for ${material.bom.item.name}`, snapshotId: snapshot.id })


}

export const createPurchasingRequestForRule = async (
  itemId: string,
  requestingUserId: string,
  inventory: Inventory,
) => {
  if (!inventory.item) return

  const allocatedBprIds = inventory.allocated.map((a: any) => a.bpr.id)
  const pendingPoIds = inventory.purchases
    .filter((po) => po.purchaseOrderStatusId !== purchaseOrderStatuses.received)
    .map((po) => po.id)
  const week = DateTime.now().toFormat("WW")

  const purchasingRequest = await prisma.purchasingRequest.create({
    data: {
      statusId: requestStatuses.requested,
      itemId,
      title: `${inventory.item.name} <Week ${week}>`,
      priorityId: requestPriorities.normal,
      requestingUserId,
    },
  })

  const snapshot = await prisma.requestInventorySnapshot.create({
    data: {
      requestId: purchasingRequest.id,
      objectName: '',
      onHandQuantity: inventory.totalQuantityOnHand,
      allocatedQuantity: inventory.totalQuantityAllocated,
      availableQuantity: inventory.totalQuantityAvailable,
      allocatedBprIds,
      pendingPoIds,
      warningOverridden: false,
      warningShown: false,
    },
  })

  await createActivityLog("createPurchasingRequest", 'requestId', purchasingRequest.id, {
    context: `Auto-generated request for ${inventory.item.name} (reordering rule)`,
    snapshotId: snapshot.id,
  }, true)

  return purchasingRequest
}
