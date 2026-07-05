import ActionButton from '@/components/ActionButton'
import Text from '@/components/Text'
import useDialog from '@/hooks/useDialog'
import React, { useEffect, useState } from 'react'
import { TbPlus } from 'react-icons/tb'
import AddendumForm from './AddendumForm'
import { getStepAddendumTypes } from '../../../_functions/getStepAddendumTypes'
import useProductionWizard from '@/hooks/useProductionWizard'
import stepAddendumActions from '@/actions/production/stepAddendums'
import AddendumCard from './AddendumCard'
import { StepAddendum } from '@/types/stepAddendum'

const AddendumsPanel = () => {
  const { showDialog } = useDialog()
  const { selectedBatchStep, revalidateTrigger } = useProductionWizard()
  const [stepAddendumTypes, setStepAddendumTypes] = useState([])
  const [stepAddendums, setStepAddendums] = useState<StepAddendum[]>([])

  useEffect(() => {

    const getData = async () => {
      const data = await getStepAddendumTypes()
      setStepAddendumTypes(data)
    }

    getData();

  }, [])

  useEffect(() => {

    const getData = async () => {

      if (!selectedBatchStep) {
        throw new Error("Batch step not selected")
      }

      const data = await stepAddendumActions.getAll({ stepId: selectedBatchStep.id }, ["addendumType"])
      setStepAddendums(data)
    }

    getData();

  }, [selectedBatchStep, revalidateTrigger])




  return (
    <div className='p-4 bg-cararra-50 rounded-lg h-full flex flex-col gap-y-4'>
      <AddendumForm stepAddendumTypes={stepAddendumTypes} />

      <div className='flex justify-between'>
        <Text.SectionTitle size='small'>Addendums</Text.SectionTitle>
        <ActionButton color='neutral' onClick={() => showDialog('addNewAddendum')}><TbPlus /></ActionButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stepAddendums.map((a) => <AddendumCard key={a.id} addendum={a} />)}
      </div>


    </div>

  )
}

export default AddendumsPanel
