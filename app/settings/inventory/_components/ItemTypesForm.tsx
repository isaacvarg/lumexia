import itemTypeActions from "@/actions/inventory/itemTypeActions";
import { useAppForm } from "@/components/Form2"
import { Dispatch, SetStateAction } from "react";
import { createItemTypeConfig } from "@/app/inventory/_actions/createItemTypeConfig";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeSkuPrefix, skuPrefixError } from "@/lib/items/sku";

const ItemTypesForm = ({ setIsAdd }: { setIsAdd: Dispatch<SetStateAction<boolean>> }) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const form = useAppForm({
    defaultValues: {
      name: 'name',
      skuPrefix: '',
      isPricingExamTriggered: false,
    },
    onSubmit: async ({ value }) => {
      const skuPrefix = normalizeSkuPrefix(value.skuPrefix);
      const prefixError = skuPrefixError(skuPrefix);
      if (prefixError) {
        setError(prefixError);
        return;
      }
      setError(null);

      const newItemType = await itemTypeActions.createNew({
        name: value.name,
        skuPrefix: skuPrefix || null,
      });

      const response = await createItemTypeConfig({
        itemTypeId: newItemType.id,
        isPricingExaminationTriggerEnabled: value.isPricingExamTriggered,
      });
      form.reset()
      setIsAdd(false)
      router.refresh()
    }
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.AppField
        name="name"
      >
        {(field) => <field.TextField
          label="Name"
        />}
      </form.AppField>

      <form.AppField
        name="skuPrefix"
      >
        {(field) => <field.TextField
          label="SKU Prefix"
          description="Used to generate reference codes for new items of this type, e.g. RAW becomes RAW0001. Optional."
        />}
      </form.AppField>

      <form.AppField
        name="isPricingExamTriggered"
      >
        {(field) => <field.ToggleField
          label="Triggerts Pricing Examination"
        />}
      </form.AppField>

      {error && (
        <div role="alert" className="alert alert-error alert-soft">
          <span>{error}</span>
        </div>
      )}

      <div>
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>
      </div>



    </form>

  )
}

export default ItemTypesForm
