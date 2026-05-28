"use client";
import { useRouter } from "next/navigation";
import Dialog from "@/components/Dialog";
import { useAppForm } from "@/components/Form2";
import { researchActions } from "@/actions/research";
import useDialog from "@/hooks/useDialog";
import { Uom } from "@/actions/inventory/getAllUom";

type Props = {
  experimentId: string;
  variantId: string;
  defaultLabel: string;
  uoms: Uom[];
};

const AddSampleDialog = ({ experimentId, variantId, defaultLabel, uoms }: Props) => {
  const router = useRouter();
  const { resetDialogContext } = useDialog();

  const uomOptions = [
    { label: "Select a unit", value: "" },
    ...uoms.map((u) => ({ label: `${u.name} (${u.abbreviation})`, value: u.id })),
  ];

  const form = useAppForm({
    defaultValues: { label: defaultLabel, size: 0, uomId: "" },
    onSubmit: async ({ value }) => {
      const label = value.label.trim();
      const size = Number(value.size);
      if (!label || !Number.isFinite(size) || size <= 0 || !value.uomId) return;
      await researchActions.samples.create({
        experimentId,
        experimentVariantId: variantId,
        label,
        size,
        uomId: value.uomId,
      });
      form.reset();
      resetDialogContext();
      router.refresh();
    },
  });

  return (
    <Dialog.Root identifier={`addSample-${variantId}`}>
      <Dialog.Title>Add Sample</Dialog.Title>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="label">
          {(field) => <field.TextField label="Label" />}
        </form.AppField>
        <form.AppField name="size">
          {(field) => <field.NumberField label="Target Size" />}
        </form.AppField>
        <form.AppField name="uomId">
          {(field) => <field.SelectField label="Unit" options={uomOptions} />}
        </form.AppField>
        <div>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>
      </form>
    </Dialog.Root>
  );
};

export default AddSampleDialog;
