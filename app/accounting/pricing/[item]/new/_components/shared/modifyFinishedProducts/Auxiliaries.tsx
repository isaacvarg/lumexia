import { InterimAuxiliaryDetails, usePricingSharedActions, usePricingSharedSelection } from "@/store/pricingSharedSlice"
import { Fragment, useEffect } from "react";
import AuxiliaryCard from "./AuxiliaryCard";
import { TbPlus } from "react-icons/tb";
import AddAuxiliary from "./AddAuxiliary";

const Auxiliaries = () => {
  const { interimFinishedProductData, modifyCurrentStep, selectedFinishedProduct, auxiliaryMode } = usePricingSharedSelection()
  const { setInterimFinishedProductDatum, setAuxiliaryMode } = usePricingSharedActions()
  const keysToExclude = ['finishedProductData'];
  const auxes = Array.from(interimFinishedProductData)
    .filter(([key]) => !keysToExclude.includes(key))
    .map(([key, value]) => (value)) as InterimAuxiliaryDetails[]

  useEffect(() => {
    selectedFinishedProduct?.auxiliaries.breakdown.forEach(a => {
      const data = {
        isNew: false,
        name: a.name,
        id: a.auxiliaryId,
        quantity: a.quantity,
        difficultyAdjustmentCost: a.difficultyAdjustmentCost,
        isDirty: false,
        itemId: '',
      }
      setInterimFinishedProductDatum(a.auxiliaryId, data);
    })
  }, [selectedFinishedProduct])


  if (modifyCurrentStep !== 1) return false;

  return (
    <div className="flex flex-col gap-6">

      {auxiliaryMode === "add" && <AddAuxiliary />}

      {auxiliaryMode === 'view' && (
        <Fragment>
          <div>
            <button onClick={() => setAuxiliaryMode('add')} className="btn flex gap-2 items-center btn-secondary">
              <TbPlus className="size-6" />
              Add Auxiliary
            </button>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auxes.map(aux => <AuxiliaryCard key={aux.id} aux={aux} />)}
          </div>
        </Fragment>
      )}

    </div>
  )
}

export default Auxiliaries
