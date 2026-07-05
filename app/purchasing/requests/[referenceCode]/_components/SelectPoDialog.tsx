"use client"

import Dialog from "@/components/Dialog"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import useDialog from "@/hooks/useDialog"
import { LinkablePo } from "../_functions/getLinkablePos"
import { createLinkedPo } from "../_functions/createLinkedPo"

const SelectPoDialog = ({ requestId, linkablePos }: { requestId: string, linkablePos: LinkablePo[] }) => {

  const { resetDialogContext } = useDialog()

  const handlePoSelect = async (poId: string, poItemId: string) => {
    await createLinkedPo({ requestId, poId }, poItemId)
    await createActivityLog('requestLinkPo', 'request', requestId, { context: `po ${poId} linked to request` })
    resetDialogContext()
  }

  return (
    <Dialog.Root identifier="actionLinkPosToPurchasingRequest">
      <Dialog.Title>Link a Purchase Order</Dialog.Title>

      <div className="flex flex-col gap-y-6">
        <p> These are purchase orders that contain this material. Select a PO to link to this Purchasing Request</p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto">
          {linkablePos.map((po) => {
            return (
              <div
                key={po.purchaseOrders.id}
                className="bg-accent/50 hover:bg-accent/30 rounded-xl hover:cursor-pointer py-4 px-6"
                onClick={() => handlePoSelect(po.purchaseOrderId, po.id)}
              >
                <span className="card-title">{po.purchaseOrders.referenceCode} - {po.purchaseOrders.supplier.name}</span>

                <div className="flex justify-between">

                  <span>{po.quantity} {po.uom.abbreviation}</span>
                  <span className="badge badge-info">{po.purchaseOrderStatus.name}</span>
                </div>

              </div>
            )
          })}

        </div>
      </div>


    </Dialog.Root>
  )
}

export default SelectPoDialog
