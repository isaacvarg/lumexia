import React from 'react'
import Title from '../../_components/Title';
import CircleBadge from '@/components/UI/CircleBadge';
import bprBatchStepActions from '@/actions/production/bprBatchSteps';
import { getBpr } from '../../_functions/getBpr';
import { ExBprBatchStep } from '@/types/bprBatchStep';
import stepEquipmentActions from '@/actions/production/stepEquipment';
import { GiCauldron } from "react-icons/gi";
import Card from '@/components/Card';
import { StepEquipment } from '@/types/stepEquipment';
import billOfMaterialActions from '@/actions/production/billOfMaterials';
import { ExBillOfMaterials } from '@/types/billOfMaterials';
import { MdOilBarrel } from 'react-icons/md';
import { TbAlertHexagon, TbClipboardCheck, TbClipboardList } from 'react-icons/tb';
import stepInstructionActions from '@/actions/production/stepInstructions';
import { StepInstruction } from '@/types/stepInstruction';
import stepAddendumActions from '@/actions/production/stepAddendums';
import { StepAddendum } from '@/types/stepAddendum';
import AddendumCard from './_components/AddendumCard';
import ActionableCard from './_components/ActionableCard';
import { getActionables } from './_function/getActionables';
import { getUserId } from '@/actions/users/getUserId';
import userRoleAssignmentActions from '@/actions/users/userRoleAssignments';
import { getIsStepCompleted } from './_function/getIsStepCompleted';
import StepActionsPanel from './_components/StepActionsPanel';
import ReadOnly from './_components/ReadOnly';
import Locked from './_components/Locked';
import { getBom } from './_function/getBom';
import HelperSetter from '@/components/Helper/HelperSetter';

type StepPageProps = {
  searchParams: {
    id: string;
    isReadOnly: string;
    isLocked: string;
  };
};

const StepPage = async ({ searchParams }: StepPageProps) => {

  const { id, isReadOnly, isLocked } = searchParams;
  const userId = await getUserId()
  const step: ExBprBatchStep = await bprBatchStepActions.getOne(id, undefined, ["bpr", "batchStep"])
  const bpr = await getBpr(step.bpr.id)
  const equipment = await stepEquipmentActions.getAll({ stepId: step.batchStepId }, ["equipment"])
  // const bom = await billOfMaterialActions.getAll({ stepId: step.batchStepId }, ["item"])
  const bom = await getBom(step.batchStepId);
  const instructions = await stepInstructionActions.getAll({ stepId: step.batchStepId })
  const addendums = await stepAddendumActions.getAll({ stepId: step.batchStepId }, ["addendumType"])
  const actionables = await getActionables(step.id)
  const userRole = await userRoleAssignmentActions.getAll({ userId });
  const isActuallyReadOnly = isReadOnly === 'true' ? true : false; //not sure why this is necessary
  const isActuallyLocked = isLocked === 'true' ? true : false;

  if (userRole.length > 1 || userRole.length === 0) { throw new Error("User has too many or no user role assignments.") }

  const filteredActionables = actionables.filter((actionable) => actionable.stepActionable.actionableType.userRoleId === userRole[0].userRoleId)

  const isStepCompleted = getIsStepCompleted(filteredActionables as any)

  // this helps determine the next status for the stepactionspanel
  const isVerificationRequired = filteredActionables.some((actionable) => actionable.stepActionable.verificationRequired === true);

  if (!bpr) return


  return (
    <div className='flex flex-col gap-y-4'>
      <HelperSetter section="compounding-step" />
      <Title bpr={bpr as any} />

      <Locked isLocked={isActuallyLocked} />
      <ReadOnly isReadOnly={isReadOnly} />

      <div className='flex flex-col gap-y-4'>
        <h1 className='font-poppins font-bold text-base-content text-4xl flex justify-center'>Step &gt; {step.batchStep.label}</h1>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>

          {!isActuallyReadOnly && <StepActionsPanel isVerificationRequired={isVerificationRequired} isStepCompleted={isStepCompleted} bprBatchStep={step} />}

          {!isActuallyReadOnly && !isActuallyLocked ? (<div className='col-span-1 sm:col-span-2'>
            <Card.Root>
              <Card.Title><span className='flex gap-x-2 items-center'><TbClipboardCheck /> <p>Actionables</p></span></Card.Title>

              {actionables.map((actionable) => <ActionableCard key={actionable.id} userRole={userRole[0]} actionable={actionable as any} />)}

            </Card.Root>
          </div>) : <div className='col-span-1 sm:col-span-2' />
          }

          <Card.Root>
            <Card.Title><span className='flex gap-x-2 items-center'><GiCauldron /> <p>Equipment</p></span></Card.Title>
            {equipment.map((eq: StepEquipment) => {
              return <div key={eq.id} className='flex flex-col p-6 bg-bone-200 rounded-lg shadow-lg'>
                <p className='font-inter text-lg text-neutral-900 font-semibold'>{eq.equipment.name}</p>
              </div>
            })}
          </Card.Root>

          <Card.Root>
            <Card.Title><span className='flex gap-x-2 items-center'><MdOilBarrel /> <p>Equipment</p></span></Card.Title>
            {bom.map((item: any) => {
              return <div key={item.id} className='flex flex-col p-6 bg-bone-200 rounded-lg shadow-lg'>
                <span className='flex gap-x-3 items-center font-inter text-lg text-neutral-900 font-semibold'><CircleBadge className='text-swirl-100 bg-swirl-900'>{item.identifier}</CircleBadge> <p>{`${item.item.name} ${item.aliasesAll.length < 1 ? "" : `(${item.aliasesAll})`}`}</p></span>
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
    </div>

  )
}

export default StepPage
