"use server"

import { getUserId } from "@/actions/users/getUserId";
import { poAccountingStatuses } from "@/configs/staticRecords/poAccountingStatuses";
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import prisma from "@/lib/prisma";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { revalidatePath } from "next/cache";

export const createNewPO = async (supplierId: string, itemId: string, requestId: string) => {

  const userId = await getUserId()
  const po = await createPO(supplierId, userId);
  const poItem = await createPOItem(po.id, itemId)

  const link = await prisma.requestPurchaseOrder.create({
    data: {
      requestId,
      poId: po.id,
    }
  });

  await createActivityLog('connectPoToRequest', 'purchasingRequest', requestId, { context: `Purchase Order #${po.referenceCode} was linked to the request` })

  revalidatePath('/purchasing/requests/[referenceCode]');

  return link

}

const createPO = async (supplierId: string, userId: string) => {

  const response = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      submittingUserId: userId,
      statusId: purchaseOrderStatuses.draft,
      recordStatusId: recordStatuses.active,
    }
  })

  await prisma.poAccountingDetail.create({
    data: {
      purchaseOrderId: response.id,
      statusId: poAccountingStatuses.notStarted,
      paid: false,
      packingSlipReceived: false,
      paperworkGivenToAdmin: false,
    }
  })

  await createActivityLog('createPurchaseOrder', 'purchaseOrder', response.id, { context: `PO #${response.referenceCode} created` })

  return response;

}


const createPOItem = async (poId: string, itemId: string) => {

  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId }, select: { inventoryUomId: true } });

  const response = await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId: poId,
      itemId,
      quantity: 0,
      pricePerUnit: 0,
      uomId: item.inventoryUomId,
      purchaseOrderStatusId: purchaseOrderStatuses.draft
    },
    include: {
      item: true,
      purchaseOrders: true
    }
  })

  await prisma.purchaseOrderItemDetail.create({
    data: {
      poItemId: response.id,
    }
  })

  await createActivityLog('createPurchaseOrderItem', 'purchaseOrder', poId, { context: `New ${response.item.name} was added to PO #${response.purchaseOrders.referenceCode}`, poItemId: response.id, itemId: response.item.id })

  return response

}
