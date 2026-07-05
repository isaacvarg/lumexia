import { Dispatch, SetStateAction } from "react"
import { PaymentMethodType } from "./PaymentMethodWizard"
import Text from "@/components/Text"

const StepType = ({ setSelectedType, nextStep, step, selectedType }: { setSelectedType: Dispatch<SetStateAction<PaymentMethodType>>, nextStep: () => void, step: number, selectedType: PaymentMethodType }) => {

    const types: PaymentMethodType[] = ['visa', 'mastercard', 'amex', 'bankTransfer', 'check'];

    const handleSelection = (type: PaymentMethodType) => {
        setSelectedType(type)
        nextStep();
    }

    if (step !== 0) return false

    return (
        <div className="flex flex-col gap-y-6">

            <Text.Normal>Please select a payment method type.</Text.Normal>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {types.map(t => {
                    const isSelected = t === selectedType
                    return (
                        <div
                            key={t}
                            className={`${isSelected ? 'bg-emerald-200' : 'bg-neutral-200'} hover:bg-neutral-300 rounded-xl hover:cursor-pointer p-6 flex items-center justify-center`}
                            onClick={() => handleSelection(t)}
                        >
                            <p className="uppercase font-poppins text-xl font-medium">{t === 'bankTransfer' ? 'bank transfer' : t}</p>
                        </div>
                    )
                })}




            </div>

            <div className="flex justify-end gap-x-4">

            <button className="btn btn-success" onClick={() => nextStep()}>Next Step</button>

            </div>




        </div >
    )
}

export default StepType
