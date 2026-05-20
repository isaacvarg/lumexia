import { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import { generateQR } from "@/actions/qr/generateQR";
import { useAppForm } from "@/components/Form2";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { LabelData, createLabelsPDF } from "@/utils/pdf/generators/itemLabels/createLabelsPDF";
import { useMemo } from "react";

const LabelForm = ({ items, onComplete }: { items: PurchaseOrderItem[], onComplete: () => void; }) => {

  const defaults = useMemo(() => {
    return items.map(i => ({
      purcahseOrderItemId: i.id,
      itemName: i.item.name,
      labelQuantity: 1,
      lot: i.lot,
      poId: i.purchaseOrderId
    }))
  }, [items])

  const form = useAppForm({
    defaultValues: {
      items: defaults,
    },
    onSubmit: async ({ value }) => {
      const labels = (await Promise.all(value.items.map(async (i) => {
        if (!i.lot) return;

        const qr = await generateQR(i.lot.id)
        await createActivityLog('Printed Labels', 'purchaseOrder', i.poId, { context: `Printed ${i.labelQuantity} labels for ${i.itemName}` })

        return {
          lot: i.lot,
          quantity: i.labelQuantity,
          qr: qr,
        }


      }))).filter((i) => i !== undefined)


      createLabelsPDF(labels as any);

      onComplete();
    }
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >



      <form.AppField name="items" mode="array">
        {(field) => {
          return (
            <div className="grid grid-cols-3 gap-6">
              {field.state.value.map((_, i) => {
                return (
                  <div
                    key={`partials[${i}].purchaseOrderItemId`}
                    className="flex flex-col gap-2  border-base-300 border-2 p-6 rounded-xl"
                  >

                    <label className="font-medium text-xl text-base-content">{_.itemName}</label>

                    <form.AppField
                      name={`items[${i}].labelQuantity`} >
                      {(subField) => <subField.NumberField labelClass="soft" label={`Labels To Print`} />}
                    </form.AppField>
                  </div>
                )
              })}
            </div>
          )
        }}
      </form.AppField>

      <div>
        <form.AppForm>
          <form.SubmitButton>Print</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  )
}

export default LabelForm
