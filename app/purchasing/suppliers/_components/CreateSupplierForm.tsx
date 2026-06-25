"use client";
import { revalidatePage } from "@/actions/app/revalidatePage";
import supplierActions from "@/actions/purchasing/supplierActions";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import useDialog from "@/hooks/useDialog";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
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

// Blank optional fields should persist as NULL rather than empty strings.
const emptyToNull = (value: string | undefined) =>
  value && value.trim().length > 0 ? value : null;

const CreateSupplierForm = () => {
  const form = useForm<Inputs>();
  const [showDetails, setShowDetails] = React.useState(false);

  const { resetDialogContext } = useDialog();

  const handleSubmit = async (data: Inputs) => {
    const newSupplier = await supplierActions.createNew({
      name: data.name,
      addressStreet1: emptyToNull(data.addressStreet1),
      addressStreet2: emptyToNull(data.addressStreet2),
      addressCity: emptyToNull(data.addressCity),
      addressState: emptyToNull(data.addressState),
      addressZip: emptyToNull(data.addressZip),
      phone: emptyToNull(data.phone),
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

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="self-start font-poppins text-base text-cutty-sark-600 underline"
        >
          {showDetails ? "Hide additional details" : "Add additional details"}
        </button>

        {showDetails && (
          <>
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
          </>
        )}

        <Form.ActionRow form={form} />
      </Form.Root>
    </Dialog.Root>
  );
};

export default CreateSupplierForm;
