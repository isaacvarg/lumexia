'use client'
import uomActions from "@/actions/inventory/uomActions"
import { Uom } from "@/actions/inventory/getAllUom"
import { useAppForm } from "@/components/Form2"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useMemo } from "react"

const UomForm = ({ selected, setSelected, setIsEdit }: { selected: Uom | null, setSelected: Dispatch<SetStateAction<Uom | null>>, setIsEdit: Dispatch<SetStateAction<boolean>> }) => {

  const router = useRouter();

  const defaultValues = useMemo(() => ({
    name: selected ? selected.name : '',
    abbreviation: selected ? selected.abbreviation : '',
  }), [selected]);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {

      if (selected) {
        await uomActions.update({ id: selected.id }, value);
      } else {
        await uomActions.createNew(value);
      }

      form.reset();
      setSelected(null);
      setIsEdit(false);
      router.refresh();
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
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>

      <form.AppField name="abbreviation">
        {(field) => <field.TextField label="Abbreviation" />}
      </form.AppField>

      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>

        <button type="button" className="btn" onClick={() => {
          setIsEdit(false);
          setSelected(null);
        }}>Cancel</button>
      </div>
    </form>
  )
}

export default UomForm
