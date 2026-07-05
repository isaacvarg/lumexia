import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import { usePurchasingActions, usePurchasingSelection } from "@/store/purchasingSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { useStore } from "@tanstack/react-form"
import { useMemo, useState } from "react"
import { handleLineItemUpdates } from "../../_functions/handleLineItemUpdates"
import { useRouter } from "next/navigation"
import { TbPlus, TbTrash, TbX } from "react-icons/tb"
import AddItem from "./AddItem"
import purchaseOrderItemActions from "@/actions/purchasing/purchaseOrderItemActions"
import { useHotkeys } from "react-hotkeys-hook"

const LineItemRow = ({ form, index, options, itemName }: {
  form: any,
  index: number,
  options: any,
  itemName: string
}) => {
  const { quantity, pricePerUnit, id } = useStore(form.store, (state: any) => state.values.items[index]);
  const total = toFracitonalDigits.curreny(quantity * pricePerUnit);
  const router = useRouter()

  const handleRemove = async () => {
    await purchaseOrderItemActions.deleteOne({ id, });
    router.refresh()

  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="font-medium text-xl text-base-content">{itemName}</label>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 w-full gap-2'>
        <form.AppField
          name={`items[${index}].quantity`} >
          {(subField: any) => (
            <subField.NumberField label={'Quantity'} labelClass="soft" />
          )}
        </form.AppField>
        <form.AppField
          name={`items[${index}].pricePerUnit`} >
          {(subField: any) => (
            <subField.NumberField label={'Price Per Unit'} labelClass="soft" />
          )}
        </form.AppField>
        <form.AppField
          name={`items[${index}].uomId`} >
          {(subField: any) => (
            <subField.SelectField label={'UOM'} labelClass="soft" options={options.uoms.map((u: any) => ({ label: u.name, value: u.id }))} />
          )}
        </form.AppField>
        <div className="flex flex-col gap-2">
          <label className="font-normal text-lg text-base-content/70">Total</label>
          <div className="flex flex-col justify-center h-full">
            <div className="font-light text-lg text-base-content/80">{`$ ${total}`}</div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center ">
          <button
            type="button"
            onClick={() => handleRemove()}
            className="btn btn-soft btn-error"
          >
            <TbTrash className={'size-4'} />
          </button>
        </div>
      </div>
    </div>
  )
}

const EditMode = () => {
  const { orderItems, options, purchaseOrder } = usePurchasingSelection()
  const { setLineItemsMode } = usePurchasingActions()
  const router = useRouter()
  const [isAddMode, setIsAddMode] = useState<boolean>(false);

  const defaultValues = useMemo(() => {
    return orderItems.map((i: any) => ({
      id: i.id,
      uomId: i.uomId,
      itemName: i.item.name,
      quantity: i.quantity,
      pricePerUnit: i.pricePerUnit
    }))

  }, [orderItems])

  const handleAddItem = async () => {
    setIsAddMode(true);
  }

  const form = useAppForm({
    defaultValues: {
      items: defaultValues
    },
    onSubmit: ({ value }) => {
      if (!purchaseOrder) return;
      handleLineItemUpdates(value.items, purchaseOrder.id)
      setLineItemsMode('view')

      router.refresh()

    }
  });

  useHotkeys('ctrl+r', () => setIsAddMode(state => !state), { preventDefault: true })


  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <SectionTitle>Order Items</SectionTitle>
        {!isAddMode && (<button onClick={() => handleAddItem()} className="btn btn-secondary flex gap-2 items-center justify-center">
          <TbPlus className="size-4" />
          Add Item
        </button>
        )}

        {isAddMode && (<button onClick={() => setIsAddMode(false)} className="btn btn-warning flex gap-2 items-center justify-center">
          <TbX className="size-4" />
          Cancel
        </button>
        )}
      </div>

      {isAddMode && <AddItem setIsAddMode={setIsAddMode} />}


      {!isAddMode && (
        <Card.Root>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >


            <form.AppField name="items" mode="array">
              {(field: any) => {
                return (
                  <div className="flex flex-col gap-4">
                    {field.state.value.map((item: any, i: number) => {
                      return (
                        <LineItemRow
                          key={item.id}
                          form={form}
                          index={i}
                          options={options}
                          itemName={item.itemName}
                        />
                      )
                    })}
                  </div>
                )
              }}

            </form.AppField>


            <div className="flex gap-2">
              <form.AppForm>
                <form.SubmitButton />
              </form.AppForm>

              <button type={'button'} className="btn btn-warning" onClick={() => setLineItemsMode('view')}>Cancel</button>
            </div>


          </form>


        </Card.Root>
      )}


    </div>
  )
}



export default EditMode
