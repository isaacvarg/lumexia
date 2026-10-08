import { purchasingActions } from "@/actions/purchasing";
import PageTitle from "@/components/Text/PageTitle";
import RecievedTable from "./_components/RecievedTable";
import ReceivePanel from "./_components/ReceivePanel";
import ReceiptHistory from "./_components/ReceiptHistory";
import HelperSetter from "@/components/Helper/HelperSetter";
import { getReceivingData } from "@/lib/receiving/queries";

const ReceivingDetails = async ({ searchParams }: { searchParams: { id: string } }) => {

  const purchaseOrder = await purchasingActions.purchaseOrders.getOne(searchParams.id);

  if (!purchaseOrder) { return <Skeleton /> }

  const [poItems, receiving] = await Promise.all([
    purchasingActions.purchaseOrders.items.getAll(searchParams.id),
    getReceivingData(purchaseOrder.id),
  ]);

  return (
    <div className="flex flex-col gap-y-8">
      <HelperSetter section="receiving-detail" />
      <PageTitle>
        {`#${purchaseOrder.referenceCode} - ${purchaseOrder.supplier.name}`}
      </PageTitle>

      <ReceivePanel
        purchaseOrder={{ id: purchaseOrder.id, referenceCode: purchaseOrder.referenceCode, supplierName: purchaseOrder.supplier.name }}
        items={poItems}
        expectations={receiving.expectations}
        fileTypes={receiving.fileTypes}
      />

      <ReceiptHistory receipts={receiving.receipts} fileTypes={receiving.fileTypes} />

      <RecievedTable
        items={poItems}
      />
    </div>
  )
}

const Skeleton = () => {
  return (
    <div className="flex flex-col gap-y-6">

      <div className="skeleton w-40 h-12" />

    </div>
  )
}

export default ReceivingDetails;
