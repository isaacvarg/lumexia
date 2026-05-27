"use client";
import { revalidatePage } from "@/actions/app/revalidatePage";
import supplierActions from "@/actions/purchasing/supplierActions";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import useDialog from "@/hooks/useDialog";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { SelectOption } from "@/types/selectOption";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { restructureData } from "@/utils/data/restructureData";
import React from "react";
import { useForm } from "react-hook-form";

type Inputs = {
  name: string;
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  phone: string;
};

const CreateSupplierForm = () => {
  const form = useForm<Inputs>();

  const { resetDialogContext } = useDialog();

  const handleSubmit = async (data: Inputs) => {
    const newSupplier = await supplierActions.createNew({
      ...data,
      recordStatusId: recordStatuses.active,
    });

    await createActivityLog("createSupplier", "supplier", newSupplier.id, {
      context: `'${newSupplier.name}' supplier was created`,
    });
    resetDialogContext();
    revalidatePage("/purchasing/suppliers");
  };

  return (
    <Dialog.Root identifier="createSupplier">
      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Text form={form} label="Name" fieldName="name" required />
        <Form.Text
          form={form}
          label="Street 1"
          fieldName="addressStreet1"
          required={false}
        />
        <Form.Text
          form={form}
          label="Street 2"
          fieldName="addressStreet2"
          required={false}
        />
        <Form.Text
          form={form}
          label="City"
          fieldName="addressCity"
          required={false}
        />
        <Form.Text
          form={form}
          label="State"
          fieldName="addressState"
          required={false}
        />
        <Form.Text
          form={form}
          label="Zipcode"
          fieldName="addressZip"
          required={false}
        />
        <Form.Text
          form={form}
          label="Phone"
          fieldName="phone"
          required={false}
        />

        <Form.ActionRow form={form} />
      </Form.Root>
    </Dialog.Root>
  );
};

export default CreateSupplierForm;
