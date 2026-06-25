"use client";

import { revalidatePage } from "@/actions/app/revalidatePage";
import purchaseOrderActions from "@/actions/purchasing/purchaseOrderActions";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import useDialog from "@/hooks/useDialog";
import { SelectOption } from "@/types/selectOption";
import { SupplierPaymentMethod } from "@/types/supplierPaymentMethod";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { restructureData } from "@/utils/data/restructureData";
import { useForm } from "react-hook-form";

type Inputs = {
  paymentMethodId: string;
};

const PaymentMethodForm = ({
  methods,
  purchaseOrderId
}: {
  methods: SupplierPaymentMethod[],
  purchaseOrderId: string
}) => {
  const form = useForm<Inputs>();
  const { resetDialogContext } = useDialog();

  const handleSubmit =  async (data: Inputs) => {

    const method = methods[methods.findIndex(method => method.id = data.paymentMethodId)]
    await purchaseOrderActions.update({id: purchaseOrderId }, {
      paymentMethodId: data.paymentMethodId
    })
  
    await createActivityLog('selectPaymentMethod', "purchaseOrder", purchaseOrderId, {context: `Attached ${method.paymentMethod.methodName} <${method.paymentMethod.identifier}> to purchase order`})

    resetDialogContext()
    revalidatePage('/purchasing/purchase-orders/[purchaseOrder]')
  };

 const options = methods.map(method => {
  return {
    value: method.paymentMethod.id,
    label: method.paymentMethod.methodName,
  }
 })


  return (
    <Dialog.Root identifier="selectPOPaymentMethod">
      <Dialog.Title>Select Payment Method</Dialog.Title>
      <p>
        Not seeing a payment method? You likely need to link the payment method
        to the supplier as an approved payment method in the supplier
        details/configuration screen.
      </p>

      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Select
          form={form}
          label="Payment Method"
          fieldName="paymentMethodId"
          options={options as SelectOption[]}
        />

        <Form.ActionRow form={form} />
      </Form.Root>
    </Dialog.Root>
  );
};

export default PaymentMethodForm;
