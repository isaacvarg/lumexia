import { SupplierPaymentMethod } from "@/types/supplierPaymentMethod";
import { TbCreditCard } from "react-icons/tb";
import React from "react";
import DeletePaymentMethod from "./DeletePaymentMethod";

const PaymentMethod = ({ method }: { method: SupplierPaymentMethod }) => {

  return (
    <span className="flex items-center text-xl font-poppins font-semibold gap-x-4">
      <TbCreditCard className="text-4xl" />
      <div className="flex flex-row gap-x-4">
        <h1>{method.paymentMethod.methodName}</h1>
        <h1 className="text-slate-600">{method.paymentMethod.identifier}</h1>
      </div>
      <DeletePaymentMethod method={method}/>
    </span>
  );
};

const PaymentMethodsList = ({
  supplierPaymentMethods,
}: {
  supplierPaymentMethods: SupplierPaymentMethod[];
}) => {

  return (
    <div>
      {supplierPaymentMethods.length > 0 ? (
        <div>
          {supplierPaymentMethods.map((method: any) => {
            return <PaymentMethod key={method.id} method={method} />;
          })}
        </div>
      ) : (
        <h1>No Payment Methods</h1>
      )}
    </div>
  );
};

export default PaymentMethodsList;
