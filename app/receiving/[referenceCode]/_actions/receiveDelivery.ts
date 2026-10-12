'use server'

import { getUserId } from "@/actions/users/getUserId"
import { accountingActions } from "@/actions/accounting"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { receiveDelivery as receive, ReceiveInput, ReceiveResult } from "@/lib/receiving/receive"
import { updateConnectedRequests } from "./updateConnectedRequests"

export const receiveDelivery = async (input: ReceiveInput): Promise<ReceiveResult> => {
  const result = await receive(await getUserId(), input)
  if (!result.ok) return result

  // follow-ups that don't need to roll back with the receipt
  for (const item of result.items) {
    await updateConnectedRequests(input.purchaseOrderId, item.itemId, item.stillExpected)
    if (item.triggersPricing) {
      await createActivityLog('Pricing Enqueued', 'item', item.itemId, { context: `Added to pricing queue from PO reception.` })
      await accountingActions.pricing.createQueue({ itemId: item.itemId, isCompleted: false })
    }
  }

  return result
}
