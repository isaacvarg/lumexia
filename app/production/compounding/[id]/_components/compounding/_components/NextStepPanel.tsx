import { ExBprBatchStep } from '@/types/bprBatchStep'
import { sortByProperty } from '@/utils/data/sortByProperty'
import React from 'react'
import { getCurrentStep } from '../_functions/getCurrentStep'
import Card from '@/components/Card'
import StepCard from './StepCard'
import { isCurrentStepLocked } from '../_functions/getIsCurrentStepLocked'

const NextStepPanel = async ({ steps }: { steps: ExBprBatchStep[] }) => {


    const sortedSteps = sortByProperty(steps, "batchStep.sequence")
    const currentStep = await getCurrentStep(sortedSteps)

    if (!currentStep) { return null }
    const isLocked = await isCurrentStepLocked(sortedSteps, currentStep.batchStep.sequence)

    return (
        <Card.Root>
            <Card.Title>Current Step</Card.Title>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            <StepCard step={currentStep as any} isReadOnly={false} isLocked={isLocked} />
            </div>
        </Card.Root>
    )
}

export default NextStepPanel
