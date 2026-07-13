import { accountingActions } from "@/actions/accounting"
import { purchasingActions } from "@/actions/purchasing"
import purchaseOrderActions from "@/actions/purchasing/purchaseOrderActions"
import purchaseOrderItemActions from "@/actions/purchasing/purchaseOrderItemActions"
import { getUserId } from "@/actions/users/getUserId"
import Alert from "@/components/Alert"
import Card from "@/components/Card"
import { poAccountingStatuses } from "@/configs/staticRecords/poAccountingStatuses"
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses"
import useDialog from "@/hooks/useDialog"
import { usePurchasingActions, usePurchasingSelection } from "@/store/purchasingSlice"
import { useTabActions } from "@/store/tabSlice"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { cancelPurchaseOrder } from "../../../_functions/cancelPurchaseOrder"
import { useRouter } from "next/navigation"

const Options = () => {

  const { purchaseOrder, orderItems } = usePurchasingSelection()
  const { setActiveTab } = useTabActions()
  const router = useRouter()
  const { showDialog, resetDialogContext } = useDialog()

  const handleDuplicate = async () => {

    if (!purchaseOrder || orderItems.length === 0) return;

    const { supplierId, referenceCode } = purchaseOrder;

    const userId = await getUserId()
    const newPurchaseOrder = await purchaseOrderActions.createNew({
      submittingUserId: userId,
      supplierId,
      statusId: purchaseOrderStatuses.draft,
    });

    await accountingActions.pos.details.create({
      statusId: poAccountingStatuses.notStarted,
      purchaseOrderId: newPurchaseOrder.id,
      paid: false,
      packingSlipReceived: false,
      paperworkGivenToAdmin: false,
    });


    await createActivityLog('Duplicated PO', 'purchaseOrder', purchaseOrder.id, { context: `This PO was created from duplicating PO #${referenceCode}` })

    await Promise.all(orderItems.map(async (i) => {
      return await purchaseOrderItemActions.createNew({
        purchaseOrderId: newPurchaseOrder.id,
        itemId: i.itemId,
        quantity: i.quantity,
        pricePerUnit: i.pricePerUnit,
        uomId: i.uomId,
        purchaseOrderStatusId: purchaseOrderStatuses.draft,
      })
    }));

    const path = `/purchasing/purchase-orders/${newPurchaseOrder.referenceCode}?id=${newPurchaseOrder.id}`
    router.push(path)
    setActiveTab('purchasing', 'items')
  }

  const handleCancel = async () => {
    if (!purchaseOrder) return;

    await cancelPurchaseOrder(purchaseOrder.id)

    router.push("/purchasing/purchase-orders")
    router.refresh();
    resetDialogContext()
  }

  return (
    <div className="">
      <Card.Root>
        <div className="grid col-span-1 sm:col-span-2 lg:col-span-4 ">
          <div className="flex gap-4 items-center justify-center">
            <button className="btn btn-primary min-w-60 btn-lg min-h-30 btn-outline" onClick={() => handleDuplicate()}>
              Duplicate
            </button>

            <button className="btn btn-lg min-h-30 min-w-60 btn-error btn-outline" onClick={() => showDialog('cancelPurchaseOrder')}>
              Cancel
            </button>

          </div>

        </div>

      </Card.Root>

      <Alert.Root identifier="cancelPurchaseOrder">
        <Alert.Content
          title="Cancel Purchase Order"
          action={handleCancel}
          actionLabel="Cancel Purchase Order"
          actionColor="error"
          cancelAction={resetDialogContext}
        >
          Are you sure you want to cancel this purchase order? Its open line items will be cancelled and removed from on-order quantities. This action cannot be undone.
        </Alert.Content>
      </Alert.Root>

    </div>
  )
}

export default Options
