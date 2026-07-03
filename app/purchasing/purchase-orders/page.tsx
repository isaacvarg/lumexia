import React from "react";
import PurchaseOrderTable from "./_components/PurchaseOrderTable";
import NewPurchaseOrderDialog from "./_components/NewPurchaseOrderDialog";
import { getPurchaseOrdersForDashboard } from "./_functions/getPurchaseOrders";
import HelperSetter from "@/components/Helper/HelperSetter";

const PurchasingPage = async () => {

  const purchaseOrders = await getPurchaseOrdersForDashboard();

  return (
    <div>
      <HelperSetter section="purchase-orders" />

      <PurchaseOrderTable purchaseOrders={purchaseOrders} />

      <NewPurchaseOrderDialog />
    </div>
  );
};

export default PurchasingPage;
