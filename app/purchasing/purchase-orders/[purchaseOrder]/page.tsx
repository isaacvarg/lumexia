import React from "react";
import { getPOItems } from "./_functions/getPOItems";
import { getPurchaseOrder } from "./_functions/getPurchaseOrder";
import Header from "./_components/header/Header";
import { getPoWithAccountingDetails } from "@/app/accounting/pos/_actions/getPoWithAccountingDetails";
import { getAccountingFilesByPo } from "@/app/accounting/pos/_actions/getAccountingFilesByPo";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import StateSetter from "./_components/state/StateSetter";
import POHelper from "./_components/shared/POHelper";
import { purchasingActions } from "@/actions/purchasing";

type PurchaseOrderDetailsProps = {
  searchParams: {
    id: string;
  };
};

const PurchaseOrderDetails = async ({ searchParams }: PurchaseOrderDetailsProps) => {

  const purchaseOrder = await getPurchaseOrder(searchParams.id)

  const [
    orderItems,
    poWithAccounting,
    files,
    internalNotes,
    publicNotes,
    poSupplierNotes,
    activity,
  ] = await Promise.all([
    getPOItems(purchaseOrder.id),
    getPoWithAccountingDetails(purchaseOrder.id),
    getAccountingFilesByPo(purchaseOrder.id),
    purchasingActions.purchaseOrders.notes.internal.getAll(purchaseOrder.id),
    purchasingActions.purchaseOrders.notes.public.getAll(purchaseOrder.id),
    purchasingActions.purchaseOrders.notes.supplier.getAll(purchaseOrder.supplierId),
    purchasingActions.purchaseOrders.getActivity(purchaseOrder.id),
  ])


  return (
    <div className="flex flex-col gap-y-6">

      <StateSetter
        purchaseOrder={purchaseOrder}
        orderItems={orderItems}
        poWithAccounting={poWithAccounting}
        files={files}
        internalNotes={internalNotes}
        publicNotes={publicNotes}
        poSupplierNotes={poSupplierNotes}
        activity={activity}
      />

      <POHelper />

      <Header />


      <TabSelector />
      <TabsContainer />

    </div>

  );
};

export default PurchaseOrderDetails;
