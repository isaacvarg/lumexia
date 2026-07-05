import useProductionWizard from '@/hooks/useProductionWizard'
import React from 'react'
import MaterialsPanel from '../materials/MaterialsPanel'
import { toProperCase } from '@/utils/data/toProperCase'
import Card from '@/components/Card'
import InstructionsPanel from '../instructions/InstructionsPanel'
import EquipmentPanel from '../equipment/EquipmentPanel'
import AddendumsPanel from '../addendums/AddendumsPanel'
import ActionablesPanel from '../actionables/ActionablesPanel'

const StepDetails = () => {
  const { selectedBatchStep } = useProductionWizard()


  if (!selectedBatchStep) {
    return <p>No batchstep Selected</p>
  }

  return (
    <div className='h-full'>
      <div className='mb-6'>
        <Card.Title>Step {selectedBatchStep.phase}.{selectedBatchStep.sequence}  {selectedBatchStep.label && ` - ${toProperCase(selectedBatchStep.label)}`}</Card.Title>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 h-full'>
        <MaterialsPanel />

        <InstructionsPanel />
        <EquipmentPanel />

        <AddendumsPanel />

        <ActionablesPanel />
      </div>

    </div>
  )
}

export default StepDetails
