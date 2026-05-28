"use client";
import Dialog from "@/components/Dialog";
import { useAppForm } from "@/components/Form2";
import { researchActions } from "@/actions/research";
import useDialog from "@/hooks/useDialog";
import { useRouter } from "next/navigation";

const AddVariantDialog = ({ experimentId }: { experimentId: string }) => {
  const { resetDialogContext } = useDialog();
  const router = useRouter();

  const form = useAppForm({
    defaultValues: { label: "" },
    onSubmit: async ({ value }) => {
      if (!value.label.trim()) return;
      await researchActions.variants.create({ experimentId, label: value.label.trim() });
      form.reset();
      resetDialogContext();
      router.refresh();
    },
  });

  return (
    <Dialog.Root identifier="addVariant">
      <Dialog.Title>Add Variant</Dialog.Title>
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
        <div>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>
      </form>
    </Dialog.Root>
  );
};

export default AddVariantDialog;
