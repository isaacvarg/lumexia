"use client";
import { revalidatePage } from "@/actions/app/revalidatePage";
import supplierPaymentMethodActions from "@/actions/purchasing/supplierPaymentMethods";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import useDialog from "@/hooks/useDialog";
import { PaymentMethod } from "@/types/paymentMethod";
import { SelectOption } from "@/types/selectOption";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { restructureData } from "@/utils/data/restructureData";
import React from "react";
import { useForm } from "react-hook-form";

type Inputs = {
  paymentMethodId: string;
};

const PaymentMethodForm = ({
  paymentMethods,
  supplierId,
}: {
  paymentMethods: PaymentMethod[];
  supplierId: string;
}) => {
  const form = useForm<Inputs>();
  const { resetDialogContext } = useDialog();

  const restructureAs = [
    { key: "id", rename: "value" },
    { key: "methodName", rename: "label" },
  ];

  const handleSubmit = async (data: Inputs) => {   
    const response = await supplierPaymentMethodActions.createNew({
      supplierId,
      paymentMethodId: data.paymentMethodId,
    });
    await createActivityLog('addSupplierPaymentMethod', 'supplier', supplierId, {
      context: `Payment method with id of ${response.paymentMethodId} was added to supplier`
    })
    revalidatePage("/purchasing/suppliers/[name]");
    resetDialogContext();
  };

  return (
    <Dialog.Root identifier="addPaymentMethod">
      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Select
          form={form}
          label="Payment Method"
          fieldName="paymentMethodId"
          options={
            restructureData(paymentMethods, restructureAs) as SelectOption[]
          }
        />

        <Form.ActionRow form={form} />
      </Form.Root>
    </Dialog.Root>
  );
};

export default PaymentMethodForm;
