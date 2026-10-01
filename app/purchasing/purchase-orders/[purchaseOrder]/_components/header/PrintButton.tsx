"use client";
import ActionButton from "@/components/ActionButton";
import { createPurchaseOrder } from "@/utils/pdf/generators/purchaseOrder";
import { TbCloudDownload } from "react-icons/tb"; import React from "react";
import Layout from "@/components/Layout";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { FlattenedOrderItem } from "../../_functions/flattenOrderItems";
import { Config } from "@prisma/client";
import { PurchaseOrderDetails } from "../../_functions/getPurchaseOrder";
import { usePurchasingSelection } from "@/store/purchasingSlice";

const PrintButton = ({ purchaseOrder, orderItems, company }: { purchaseOrder: PurchaseOrderDetails, orderItems: FlattenedOrderItem[], company: Config[] }) => {

  const { publicNotes, poSupplierNotes, options } = usePurchasingSelection()

  const handleClick = async () => {

    await createPurchaseOrder(purchaseOrder.referenceCode, purchaseOrder.updatedAt, purchaseOrder.supplier, orderItems, company, options.globalPoNotes, publicNotes, poSupplierNotes);

    await createActivityLog('downloadPurchaseOrderPDF', 'purchaseOrder', purchaseOrder.id, { context: 'po pdf downloaded' })
  };
  return (
    <>
      <ActionButton color="secondarySoft" onClick={handleClick} ><Layout.Row><TbCloudDownload className="text-2xl" /> PO</Layout.Row></ActionButton>
    </>
  );
};

export default PrintButton;
