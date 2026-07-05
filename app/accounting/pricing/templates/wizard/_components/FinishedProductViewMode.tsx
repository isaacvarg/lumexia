import { Panels } from "@/components/Panels";
import Text from "@/components/Text";
import { usePricingTemplateWizardSelection } from "@/store/pricingTemplateWizardSlice";
import { useState } from "react";
import { TbDeviceFloppy, TbEdit } from "react-icons/tb";
import FinishedProductEditForm from "./FinishedProductEditForm";
import FinishedProductAuxiliaries from "./FinishedProductAuxiliaries";

const FinishedProductViewMode = () => {

  const { finishedProductStepMode, selectedFinishedProduct } = usePricingTemplateWizardSelection()
  const [isEdit, setIsEdit] = useState<boolean>(false);


  if (finishedProductStepMode !== 'view') return false;


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Panels.Root bg="white">
        <div className="flex justify-between items-center">
          <Text.SectionTitle size="small">Finished Product Details</Text.SectionTitle>
          {isEdit ? '' : (
            <button className="btn btn-neutral btn-soft" onClick={() => setIsEdit(true)}><TbEdit /></button>)}

        </div>

        {isEdit && <FinishedProductEditForm setIsEdit={setIsEdit} />}
        {!isEdit && (
          <div className="flex flex-col gap-y-4">
            <Text.LabelDataPair label="Name" data={selectedFinishedProduct?.name || ""} />

            <Text.LabelDataPair label="Fill Quantity (lb)" data={selectedFinishedProduct?.fillQuantity || "0.000"} />
            <Text.LabelDataPair label="Declared Quantity (lb)" data={selectedFinishedProduct?.declaredQuantity || "0.000"} />
            <Text.LabelDataPair label="Free Shipping Cost ($)" data={selectedFinishedProduct?.freeShippingCost || "0.000"} />
            <Text.LabelDataPair label="Difficulty Adjustment Cost ($)" data={selectedFinishedProduct?.difficultyAdjustmentCost || "0.000"} />
          </div>
        )}


      </Panels.Root>

      <Panels.Root bg="white">
        <Text.SectionTitle size="small">Auxiliaries</Text.SectionTitle>

        <FinishedProductAuxiliaries />


      </Panels.Root>


    </div>
  )
}

export default FinishedProductViewMode
