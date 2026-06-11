import { useAppForm } from "@/components/Form2"
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import aliasTypeActions from "@/actions/inventory/aliasTypes";
import prisma from "@/lib/prisma";
import { createItemFileType } from "@/app/inventory/_actions/createItemFileType";

const FileTypeForm = ({ setIsAdd }: { setIsAdd: Dispatch<SetStateAction<boolean>> }) => {
  const router = useRouter()
  const form = useAppForm({
    defaultValues: {
      name: 'name',
      bgColor: '#333333',
      textColor: '#FFFFFF',
      abbreviaton: '',
      description: '',

    },
    onSubmit: async ({ value }) => {

      const { name, bgColor, abbreviaton, textColor, description } = value;
      await createItemFileType({ name, bgColor, abbreviaton, textColor, description })

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
        name="abbreviaton"
      >
        {(field) => <field.TextField
          label="Abbreviation"
        />}
      </form.AppField>

      <form.AppField
        name="description"
      >
        {(field) => <field.TextField
          label="Description"
        />}
      </form.AppField>

      <form.AppField
        name="bgColor"
      >
        {(field) => <field.TextField
          label="Background Color"
        />}
      </form.AppField>

      <form.AppField
        name="textColor"
      >
        {(field) => <field.TextField
          label="Text Color"
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

export default FileTypeForm
