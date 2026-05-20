import { useAppForm } from "@/components/Form2";
import { usePricingSharedActions, usePricingSharedSelection } from "@/store/pricingSharedSlice"

const FinishedProductDetails = () => {

  const { modifyCurrentStep, modifyMode, selectedFinishedProduct } = usePricingSharedSelection()
  const { setModifyCurrentStep, setInterimFinishedProductDatum, } = usePricingSharedActions()
  const isEditable = modifyMode === 'edit' && selectedFinishedProduct

  const defaults = {
    name: isEditable ? selectedFinishedProduct.name : '',
    fillQuantity: isEditable ? selectedFinishedProduct.fillQuantity : 0,
    declaredQuantity: isEditable ? selectedFinishedProduct.declaredQuantity : 0,
    difficultyAdjustmentCost: isEditable ? selectedFinishedProduct.difficultyAdjustmentCost : 0,
    freeShippingCost: isEditable ? selectedFinishedProduct.freeShippingCost : 0,
  }

  const form = useAppForm({
    defaultValues: defaults,
    onSubmit: ({ value }) => {
      const additionalProperties = {
        isNew: isEditable ? false : true,
        id: isEditable ? selectedFinishedProduct.id : '',
      }

      setInterimFinishedProductDatum("finishedProductData", { ...value, ...additionalProperties })
      setModifyCurrentStep(1);
    }
  })

  if (modifyCurrentStep !== 0) return false;


  return (
    <div>
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
          name="fillQuantity"
        >
          {(field) => <field.NumberField
            label="Fill Quantity (lbs)"
          />}
        </form.AppField>

        <form.AppField
          name="declaredQuantity"
        >
          {(field) => <field.NumberField
            label="Declared Quantity (lbs)"
          />}
        </form.AppField>

        <form.AppField
          name="difficultyAdjustmentCost"
        >
          {(field) => <field.NumberField
            label="Difficulty Adjustment Cost ($)"
          />}
        </form.AppField>
        <form.AppField
          name="freeShippingCost"
        >
          {(field) => <field.NumberField
            label="Free Shipping Cost ($)"
          />}
        </form.AppField>

        <div>
          <form.AppForm>
            <form.SubmitButton>
              Next
            </form.SubmitButton>
          </form.AppForm>
        </div>



      </form>

    </div>
  )
}

export default FinishedProductDetails
