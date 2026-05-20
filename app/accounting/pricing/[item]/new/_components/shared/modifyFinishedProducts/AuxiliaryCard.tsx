import { accountingActions } from "@/actions/accounting"
import { useAppForm } from "@/components/Form2"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import { InterimAuxiliaryDetails, usePricingSharedActions } from "@/store/pricingSharedSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { useRouter } from "next/navigation"
import { Fragment, useState } from "react"
import { TbEdit, TbPlus, TbTrash, TbX } from "react-icons/tb"

type Props = {
  aux: InterimAuxiliaryDetails
}

const AuxiliaryCard = ({ aux }: Props) => {

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { setInterimFinishedProductDatum, deleteInterimFinishedProductData } = usePricingSharedActions()
  const router = useRouter()

  const handleDelete = async () => {

    await accountingActions.finishedProducts.auxiliaries.update(aux.id, {
      recordStatusId: recordStatuses.archived,
    });

    deleteInterimFinishedProductData(aux.id);
    router.refresh();

  }

  const form = useAppForm({
    defaultValues: {
      quantity: aux.quantity,
      difficultyAdjustmentCost: aux.difficultyAdjustmentCost,
    },
    onSubmit: ({ value }) => {
      setInterimFinishedProductDatum(aux.id, {
        isNew: aux.isNew,
        name: aux.name,
        id: aux.id,
        quantity: value.quantity,
        difficultyAdjustmentCost: value.difficultyAdjustmentCost,
        isDirty: true,
        itemId: aux.itemId,
      })
      setIsEdit(false);
    }
  })


  return (
    <Fragment>

      {isEdit && (
        <div
          key={aux.id}
          className="p-6 rounded-xl bg-base-100/50 shadow-lg flex flex-col gap-4"
        >

          <div className="flex justify-end gap-2 items-center">
            <button onClick={() => {
              setInterimFinishedProductDatum(aux.id, aux)
              setIsEdit(false);
            }} className="btn btn-sm btn-outline btn-warning">Cancel</button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.AppField
              name="quantity"
            >
              {(field) => <field.NumberField
                label="Quantity"
              />}
            </form.AppField>

            <form.AppField
              name="difficultyAdjustmentCost"
            >
              {(field) => <field.NumberField
                label="Difficulty Adjustment Cost ($)"
              />}
            </form.AppField>


            <div>
              <form.AppForm>
                <form.SubmitButton>
                  Save
                </form.SubmitButton>
              </form.AppForm>
            </div>
          </form>
        </div>
      )}

      {!isEdit && (
        <div
          className="p-6 rounded-xl bg-base-100/50 shadow-lg flex flex-col gap-4"
        >


          <div className="flex justify-end gap-2 items-center">

            <button onClick={() => setIsEdit(true)} className="btn btn-sm btn-outline btn-secondary"><TbEdit className="size-4" /></button>
            <button onClick={handleDelete} className="btn btn-sm btn-outline btn-error"><TbTrash className="size-4" /></button>
          </div>



          <div className="font-poppins text-xl font-medium text-base-content items-center text-center">{aux.name}</div>

          <div className=" flex gap-2 items-center justify-center font-poppins text-xl text-base-content font-semibold">
            <TbX className="size-6" />
            {aux.quantity}
          </div>

          <div className=" flex gap-2 items-center justify-center font-poppins text-xl text-base-content font-semibold">
            <TbPlus className="size-6" />
            {`$ ${toFracitonalDigits.pricingCurrency(aux.difficultyAdjustmentCost)}`}
          </div>


        </div>
      )}
    </Fragment>
  )
}

export default AuxiliaryCard
