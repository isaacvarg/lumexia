"use client";
import ActionButton from "@/components/ActionButton";
import { PaymentMethod } from "@/types/paymentMethod";
import { SupplierPaymentMethod } from "@/types/supplierPaymentMethod";
import React from "react";
import { TbCreditCard } from "react-icons/tb";
import PaymentMethodForm from "./PaymentMethodForm";
import useDialog from "@/hooks/useDialog";
import { PurchaseOrder } from "@/types/purchaseOrder";

const PaymentMethodSelector = ({
  method,
  supplierPaymentMethods,
}: {
  method: PurchaseOrder;
  supplierPaymentMethods: SupplierPaymentMethod[];
}) => {
  const { showDialog } = useDialog();
  const handleChangePaymentMethod = () => {
    showDialog("selectPOPaymentMethod");
  };
  if (!method) {
    return (
      <ActionButton onClick={handleChangePaymentMethod}>
        Select Payment Method
      </ActionButton>
    );
  }
  console.log(method)
  return (
    <>
      <span className="flex items-center text-xl font-poppins font-semibold gap-x-4" onClick={() => handleChangePaymentMethod()}>
        <TbCreditCard className="text-4xl" />
        <div className="flex flex-row gap-x-4">
          <h1>{method.paymentMethod.methodName }</h1>
          <h1 className="text-slate-600">{method.paymentMethod.identifier}</h1>
        </div>
      </span>
    </>
  );
};

export default PaymentMethodSelector;
