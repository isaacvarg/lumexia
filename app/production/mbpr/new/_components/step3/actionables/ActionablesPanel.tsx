"use client"


import React, { useEffect, useState } from 'react'
import Text from '@/components/Text'
import ActionButton from '@/components/ActionButton'
import useDialog from '@/hooks/useDialog'
import { TbPlus } from 'react-icons/tb'
import userRoleActions from '@/actions/users/userRoles'
import ActionableTypeForm from './ActionableTypeForm'
import stepActionableTypeActions from '@/actions/production/stepActionableTypes'
import useProductionWizard from '@/hooks/useProductionWizard'
import ActionableForm from './ActionableForm'
import stepActionableActions from '@/actions/production/stepActionables'
import ActionableCard from './ActionableCard'
import { StepActionable } from '@/types/stepActionable'

const ActionablesPanel = () => {
  const { showDialog } = useDialog();
  const [userRoles, setUserRoles] = useState([]);
  const [actionableTypes, setActionableTypes] = useState([])
  const { revalidateTrigger, selectedBatchStep } = useProductionWizard()
  const [stepActionables, setStepActionables] = useState<StepActionable[]>([])

  useEffect(() => {

    const getData = async () => {
      const data = await userRoleActions.getAll();
      setUserRoles(data)
    }

    getData();

  }, [])

  useEffect(() => {

    const getData = async () => {
      const data = await stepActionableTypeActions.getAll();
      setActionableTypes(data)
    }

    getData();

  }, [revalidateTrigger])


  useEffect(() => {

    const getData = async () => {
      if (!selectedBatchStep) { throw new Error('Batch step not selected') }

      const data = await stepActionableActions.getAll({ stepId: selectedBatchStep.id }, ["actionableType"]);
      setStepActionables(data)
    }

    getData();

  }, [selectedBatchStep, revalidateTrigger])


  return (
    <div className='p-4 bg-cararra-50 rounded-lg h-full flex flex-col gap-y-4 col-span-1 sm:col-span-2'>

      <ActionableTypeForm userRoles={userRoles} />
      <ActionableForm actionableTypes={actionableTypes} />

      <div className='flex justify-between'>
        <Text.SectionTitle size='small'>actionables </Text.SectionTitle>
        <span className='flex gap-x-2'>
          <ActionButton color='neutral' onClick={() => showDialog('createActionableForm')}><span className='flex flex-row gap-x-2 items-center text-md'><TbPlus /><p>Actionable</p></span></ActionButton>
          <ActionButton color='neutral' onClick={() => showDialog('createNewActionableType')}><span className='flex flex-row gap-x-2 items-center text-md'><TbPlus /><p>Type</p></span></ActionButton>
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {
          stepActionables.map((sa) => <ActionableCard key={sa.id} actionable={sa} />)
        }

      </div>


    </div>
  )
}

export default ActionablesPanel
