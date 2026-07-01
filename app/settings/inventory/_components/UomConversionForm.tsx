'use client'
import { inventoryActions } from "@/actions/inventory"
import { Uom } from "@/actions/inventory/getAllUom"
import { UomConversion } from "@/actions/inventory/uomConversions/getAll"
import { useAppForm } from "@/components/Form2"
import { useStore } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useMemo } from "react"

const UomConversionForm = ({ uoms, selected, setSelected, setIsEdit }: { uoms: Uom[], selected: UomConversion | null, setSelected: Dispatch<SetStateAction<UomConversion | null>>, setIsEdit: Dispatch<SetStateAction<boolean>> }) => {

  const router = useRouter();

  const uomMap = new Map(uoms.map(u => [u.id, u]));

  const defaultValues = useMemo(() => ({
    uomAId: selected ? selected.uomAId : '',
    uomBId: selected ? selected.uomBId : '',
    conversionFactor: selected ? selected.conversionFactor : 0,
  }), [selected]);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {

      if (selected) {
        await inventoryActions.uomConversions.update(selected.id, value);
      } else {
        await inventoryActions.uomConversions.create(value);
      }

      form.reset();
      setSelected(null);
      setIsEdit(false);
      router.refresh();
    }
  });

  const { uomAId, uomBId, conversionFactor } = useStore(form.store, (state: any) => state.values);

  const uomOptions = uoms.map(u => ({ label: u.name, value: u.id }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4 w-full"
    >
      <div className="flex gap-6 items-center justify-center">
        <label className="text-accent font-semibold text-4xl">{`1 ${uomMap.has(uomAId) ? uomMap.get(uomAId)?.name : ''}`}</label>
        <label className="font-semibold text-base-content text-5xl">=</label>
        <label className="text-accent font-semibold text-4xl">{`${conversionFactor} ${uomMap.has(uomBId) ? uomMap.get(uomBId)?.name : ''}`}</label>
      </div>

      <form.AppField name="uomAId">
        {(field) => <field.SelectField label="From UOM" options={uomOptions} />}
      </form.AppField>

      <form.AppField name="conversionFactor">
        {(field) => <field.NumberField label="Conversion Factor" />}
      </form.AppField>

      <form.AppField name="uomBId">
        {(field) => <field.SelectField label="To UOM" options={uomOptions} />}
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

export default UomConversionForm
