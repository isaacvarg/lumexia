import { useState } from "react"
import AuxiliaryForm from "./AuxiliaryForm"
import { usePricingTemplateWizardActions, usePricingTemplateWizardSelection } from "@/store/pricingTemplateWizardSlice";
import { TbTrash } from "react-icons/tb";
import { PricingTemplateAuxiliary } from "@prisma/client";
import { accountingActions } from "@/actions/accounting";

const classes = `bg-neutral-200 p-6 rounded-xl font-poppins text-lg font-semibold hover:cursor-pointer hover:bg-neutral-300 `;

const FinishedProductAuxiliaries = () => {
    const [isAddMode, setIsAddMode] = useState(false)
    const { existingAuxiliaries } = usePricingTemplateWizardSelection()
    const { setAuxiliaries } = usePricingTemplateWizardActions()

    const handleDelete = async (aux: PricingTemplateAuxiliary) => {
        await accountingActions.finishedProducts.templates.auxiliaries.delete(aux.id)

        setAuxiliaries()
    }


    return (
        <div>

            {isAddMode && <AuxiliaryForm setIsAddMode={setIsAddMode} />}

            {!isAddMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        className={classes}
                        onClick={() => setIsAddMode(true)}
                    >
                        Add New
                    </div>

                    {existingAuxiliaries.map(aux => (
                        <div
                            key={aux.id}
                            className={classes}
                        >

                            <p>{aux.auxiliaryItem.name}</p>

                            <p className="font-normal">{`Quantity: ${aux.quantity}`}</p>
                            <p className="font-normal">{`Difficulty Adjustment Cost: ${aux.difficultyAdjustmentCost}`}</p>


                            <button className="btn btn-warning w-full" onClick={() => handleDelete(aux)}><TbTrash /></button>

                        </div>
                    ))}



                </div>

            )}

        </div>
    )
}

export default FinishedProductAuxiliaries
