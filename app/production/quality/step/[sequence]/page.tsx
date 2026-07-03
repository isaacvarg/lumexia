import bprBatchStepActions from '@/actions/production/bprBatchSteps';
import bprStepActionableActions from '@/actions/production/bprStepActionables';
import Card from '@/components/Card';
import React from 'react'
import { GiCauldron } from 'react-icons/gi';
import { MdOilBarrel } from 'react-icons/md';
import { TbAlertHexagon, TbClipboardCheck, TbClipboardList } from 'react-icons/tb';
import { getActionables } from './_functions/getActionables';
import CompletedActionableCard, { QualityExBprStepActionable } from './_components/CompletedActionableCard';
import stepEquipmentActions from '@/actions/production/stepEquipment';
import { StepEquipment } from '@/types/stepEquipment';
import billOfMaterialActions from '@/actions/production/billOfMaterials';
import { ExBillOfMaterials } from '@/types/billOfMaterials';
import stepInstructionActions from '@/actions/production/stepInstructions';
import stepAddendumActions from '@/actions/production/stepAddendums';
import { StepInstruction } from '@/types/stepInstruction';
import { StepAddendum } from '@/types/stepAddendum';
import AddendumCard from '@/app/production/compounding/[id]/step/[sequence]/_components/AddendumCard';
import userRoleAssignmentActions from '@/actions/users/userRoleAssignments';
import { getUserId } from '@/actions/users/getUserId';
import ActionableCard from './_components/ActionableCard';
import QualityStepActionsPanel from './_components/QualityStepActionsPanel';
import HelperSetter from '@/components/Helper/HelperSetter';

type Props = {
  searchParams: {
    bprStepId: string;
  };
}

const StepQualityPage = async ({ searchParams }: Props) => {

  const { bprStepId } = searchParams
  const userId = await getUserId()
  const step = await bprBatchStepActions.getOne(bprStepId, undefined, ["batchStep"])
  const actionables = await getActionables(step.id)
  const equipment = await stepEquipmentActions.getAll({ stepId: step.batchStepId }, ["equipment"])
  const bom = await billOfMaterialActions.getAll({ stepId: step.batchStepId }, ["item"])
  const instructions = await stepInstructionActions.getAll({ stepId: step.batchStepId })
  const addendums = await stepAddendumActions.getAll({ stepId: step.batchStepId }, ["addendumType"])
  const userRole = await userRoleAssignmentActions.getAll({ userId });

  if (userRole.length > 1 || userRole.length === 0) { throw new Error("User has too many or no user role assignments.") }

  const completedActionables = actionables.filter((actionable) => actionable.isCompounded)

  return (
    <div className='flex flex-col gap-y-4'>
      <HelperSetter section="production-quality-verify" />
      <h1 className='font-poppins font-bold text-base-content text-4xl flex justify-center'>Step &gt; {step.batchStep.label}</h1>

      <QualityStepActionsPanel actionables={actionables as any} bprBatchStep={step} />

      <div className='grid grid-cols-2 gap-6'>

        {/*<div className='col-span-2'>
                    <Card.Root>
                        <Card.Title><span className='flex gap-x-2 items-center'><TbClipboardCheck /> <p>Quality Actionables</p></span></Card.Title>
                        <div className='grid grid-cols-3'>
                            {qualityActionables.map((actionable) => <ActionableCard key={actionable.id} userRole={userRole[0]} actionable={actionable as any} />)}
                        </div>

                    </Card.Root>
                </div>
                */}

        <div className='col-span-2'>
          <Card.Root>
            <Card.Title><span className='flex gap-x-2 items-center'><TbClipboardCheck /> <p>Completed Actionables</p></span></Card.Title>
            <div className='grid grid-cols-3'>
              {completedActionables.map((actionable) => <CompletedActionableCard key={actionable.id} actionable={actionable as any} />)}
            </div>

          </Card.Root>
        </div>

        <Card.Root>
          <Card.Title><span className='flex gap-x-2 items-center'><GiCauldron /> <p>Equipment</p></span></Card.Title>
          {equipment.map((eq: StepEquipment) => {
            return <div key={eq.id} className='flex flex-col p-6 bg-bone-200 rounded-lg shadow-lg'>
              <p className='font-inter text-lg text-neutral-900 font-semibold'>{eq.equipment.name}</p>
            </div>
          })}
        </Card.Root>

        <Card.Root>
          <Card.Title><span className='flex gap-x-2 items-center'><MdOilBarrel /> <p>Materials</p></span></Card.Title>
          {bom.map((item: ExBillOfMaterials) => {
            return <div key={item.id} className='flex flex-col p-6 bg-bone-200 rounded-lg shadow-lg'>
              <span className='flex gap-x-3 items-center font-inter text-lg text-neutral-900 font-semibold'><div className='flex items-center justify-center rounded-full text-swirl-100 w-8 h-8 bg-swirl-900 p-2'>{item.identifier}</div> <p>{item.item.name}</p></span>
            </div>
          })}
        </Card.Root>

        <Card.Root>
          <Card.Title><span className='flex gap-x-2 items-center'><TbClipboardList /> <p>Instructions</p></span></Card.Title>
          {instructions.map((instr: StepInstruction) => {
            return <div key={instr.id} className='flex flex-col p-6 bg-bone-200 rounded-lg shadow-lg'>
              <p className='font-inter text-lg text-neutral-900 font-semibold'>{instr.instructionContent}</p>
            </div>
          })}
        </Card.Root>

        <Card.Root>
          <Card.Title><span className='flex gap-x-2 items-center'><TbAlertHexagon /> <p>Addendums</p></span></Card.Title>
          {addendums.map((addendum: StepAddendum) => {
            return <AddendumCard key={addendum.id} addendum={addendum} />
          })}
        </Card.Root>



      </div>


    </div>

  )
}

export default StepQualityPage
