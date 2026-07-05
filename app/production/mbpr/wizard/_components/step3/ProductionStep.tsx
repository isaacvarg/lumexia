"use client"

import { useMbprWizardActions, useMbprWizardSelection } from "@/store/mbprWizardSlice"
import { useEffect } from "react"
import StepPanel from "./steps/StepPanel"
import StepDetailsPanel from "./details/StepDetailsPanel"
import FormPanel from "./forms/FormPanel"
import SectionTitle from "@/components/Text/SectionTitle"
import Text from "@/components/Text"

const ProductionStep = () => {
    const { isRevalidating, step,  selectedMbpr, steps, isNewlyCreated } = useMbprWizardSelection()
    const {nextStep, getSteps, setIsNewForFormPanel } = useMbprWizardActions()

    useEffect(() => {
        if (steps.length === 0 && !isNewlyCreated && selectedMbpr) {
            getSteps(selectedMbpr.id)
        }
    }, [steps, isNewlyCreated, selectedMbpr, isRevalidating, getSteps])

    if (step !== 2 || !selectedMbpr || !steps) return null

    return (
        <div className="flex flex-col gap-8">

            <div className="flex justify-between items-center">

                <SectionTitle >Production Details</SectionTitle>

                <button className="btn btn-success" onClick={() => {
                    setIsNewForFormPanel(false)
                    nextStep()
                }}>Continue</button>

            </div>


            <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
                <StepPanel />
                <StepDetailsPanel />
                <FormPanel />
            </div>
        </div>
    )
}

export default ProductionStep

