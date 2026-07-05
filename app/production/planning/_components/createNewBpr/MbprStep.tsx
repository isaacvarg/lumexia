import mbprActions from '@/actions/production/mbprActions'
import { recordStatuses } from '@/configs/staticRecords/recordStatuses'
import { MasterBatchProductionRecord } from '@/types/masterBatchProductionRecord'
import React, { useEffect, useState } from 'react'
import { useWizard } from 'react-use-wizard'

const MbprStep = ({ selectedItemId, onMbprSelection }: { selectedItemId: string | null, onMbprSelection: (mbpr: MasterBatchProductionRecord) => void }) => {
  const [mbprs, setMbprs] = useState<MasterBatchProductionRecord[]>([])
  const { nextStep } = useWizard()

  const handleMbprSelection = (mbpr: MasterBatchProductionRecord) => {
    onMbprSelection(mbpr)
    nextStep()
  }
  useEffect(() => {
    const getMbprs = async () => {
      if (!selectedItemId) {
        return;
      }
      const data = await mbprActions.getAll({ producesItemId: selectedItemId, recordStatusId: recordStatuses.active });

      setMbprs(data)
    }

    getMbprs();
  }, [selectedItemId])
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {mbprs.map(m => <div key={m.id} className='flex flex-col bg-primary/35 rounded-lg p-4 font-poppins font-semibold text-primary-content' onClick={() => handleMbprSelection(m)}>{m.versionLabel}</div>)}
    </div>
  )
}


export default MbprStep
