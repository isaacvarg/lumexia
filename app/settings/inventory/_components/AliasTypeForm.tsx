import itemTypeActions from "@/actions/inventory/itemTypeActions";
import { useAppForm } from "@/components/Form2"
import { Dispatch, SetStateAction } from "react";
import { createItemTypeConfig } from "@/app/inventory/_actions/createItemTypeConfig";
import { useRouter } from "next/navigation";
import aliasTypeActions from "@/actions/inventory/aliasTypes";

const AliasTypeForm = ({ setIsAdd }: { setIsAdd: Dispatch<SetStateAction<boolean>> }) => {
  const router = useRouter()
  const form = useAppForm({
    defaultValues: {
      name: 'name',
    },
    onSubmit: async ({ value }) => {

      await aliasTypeActions.createNew({
        name: value.name
      })
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

      <div>
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>
      </div>



    </form>

  )
}

export default AliasTypeForm
