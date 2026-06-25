"use client";

import { revalidatePage } from "@/actions/app/revalidatePage";
import supplierActions from "@/actions/purchasing/supplierActions";
import Card from "@/components/Card";
import Form from "@/components/Form";
import SectionTitle from "@/components/Text/SectionTitle";
import {
  useSupplierDetailActions,
  useSupplierDetailSelection,
} from "@/store/supplierDetailSlice";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { useForm } from "react-hook-form";

type Inputs = {
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  phone: string;
  showAddressOnPo: boolean;
};

// Blank optional fields should persist as NULL rather than empty strings.
const emptyToNull = (value: string | undefined) =>
  value && value.trim().length > 0 ? value : null;

const SupplierDetailsCard = () => {
  const { supplier } = useSupplierDetailSelection();
  const { setSupplier } = useSupplierDetailActions();

  const form = useForm<Inputs>({
    defaultValues: {
      addressStreet1: supplier?.addressStreet1 ?? "",
      addressStreet2: supplier?.addressStreet2 ?? "",
      addressCity: supplier?.addressCity ?? "",
      addressState: supplier?.addressState ?? "",
      addressZip: supplier?.addressZip ?? "",
      phone: supplier?.phone ?? "",
      showAddressOnPo: supplier?.showAddressOnPo ?? false,
    },
  });

  if (!supplier) return null;

  const handleSubmit = async (data: Inputs) => {
    const updates = {
      addressStreet1: emptyToNull(data.addressStreet1),
      addressStreet2: emptyToNull(data.addressStreet2),
      addressCity: emptyToNull(data.addressCity),
      addressState: emptyToNull(data.addressState),
      addressZip: emptyToNull(data.addressZip),
      phone: emptyToNull(data.phone),
      showAddressOnPo: data.showAddressOnPo,
    };

    await supplierActions.update({ id: supplier.id }, updates);

    await createActivityLog("updateSupplier", "supplier", supplier.id, {
      context: `'${supplier.name}' supplier details were updated`,
    });

    setSupplier({
      ...supplier,
      ...updates,
      addressStreet1: updates.addressStreet1 ?? undefined,
      addressStreet2: updates.addressStreet2 ?? undefined,
      addressCity: updates.addressCity ?? undefined,
      addressState: updates.addressState ?? undefined,
      addressZip: updates.addressZip ?? undefined,
      phone: updates.phone ?? undefined,
    });
    revalidatePage("/purchasing/suppliers/[name]");
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Supplier Details</SectionTitle>

      <Card.Root>
        <Form.Root form={form} onSubmit={handleSubmit}>
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
          <Form.Toggle
            form={form}
            label="Show address on purchase order"
            fieldName="showAddressOnPo"
          />

          <Form.ActionRow form={form} />
        </Form.Root>
      </Card.Root>
    </div>
  );
};

export default SupplierDetailsCard;
