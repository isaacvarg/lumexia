import ActionButton from '@/components/ActionButton'
import Text from '@/components/Text'
import useDialog from '@/hooks/useDialog'
import React, { useEffect, useState } from 'react'
import { TbPlus } from 'react-icons/tb'
import { getEquipment } from '../../../_functions/getEquipment'
import EquipmentForm from './EquipmentForm'
import { getStepEquipment } from '../../../_functions/getStepEquipment'
import useProductionWizard from '@/hooks/useProductionWizard'
import { StepEquipment } from '@/types/stepEquipment'
import EquipmentCard from './EquipmentCard'

const EquipmentPanel = () => {
  const { showDialog } = useDialog();
  const { selectedBatchStep, revalidateTrigger } = useProductionWizard()

  const [equipment, setEquipment] = useState([])
  const [stepEquipment, setStepEquipment] = useState<StepEquipment[]>([]) // difference between the two states is that this is equipment assigned to this step


  useEffect(() => {

    const getData = async () => {
      const data = await getEquipment()
      setEquipment(data)
    }

    getData();

  }, [])

  useEffect(() => {

    const getData = async () => {

      if (!selectedBatchStep) {
        throw new Error("Batch step not selected")
      }

      const data = await getStepEquipment(selectedBatchStep.id)
      setStepEquipment(data)
    }

    getData();

  }, [selectedBatchStep, revalidateTrigger])

  return (
    <div className='p-4 bg-cararra-50 rounded-lg h-full flex flex-col gap-y-4'>

      <EquipmentForm equipment={equipment} />

      <div className='flex justify-between'>
        <Text.SectionTitle size='small'>Equipment</Text.SectionTitle>
        <ActionButton color='neutral' onClick={() => showDialog('addStepEquipment')}><TbPlus /></ActionButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {stepEquipment.map((se: StepEquipment) => <EquipmentCard key={se.id} equipment={se} />)}
      </div>


    </div>

  )
}

export default EquipmentPanel
