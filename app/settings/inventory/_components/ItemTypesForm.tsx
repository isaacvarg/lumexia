import itemTypeActions from "@/actions/inventory/itemTypeActions";
import { useAppForm } from "@/components/Form2"
import { Dispatch, SetStateAction } from "react";
import { createItemTypeConfig } from "@/app/inventory/_actions/createItemTypeConfig";
import { useRouter } from "next/navigation";

const ItemTypesForm = ({ setIsAdd }: { setIsAdd: Dispatch<SetStateAction<boolean>> }) => {
  const router = useRouter()
  const form = useAppForm({
    defaultValues: {
      name: 'name',
      isPricingExamTriggered: false,
    },
    onSubmit: async ({ value }) => {

      const newItemType = await itemTypeActions.createNew({
        name: value.name,
      });

      console.log(newItemType);

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
        name="isPricingExamTriggered"
      >
        {(field) => <field.ToggleField
          label="Triggerts Pricing Examination"
        />}
      </form.AppField>

      <div>
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>
      </div>



    </form>

  )
}

export default ItemTypesForm
