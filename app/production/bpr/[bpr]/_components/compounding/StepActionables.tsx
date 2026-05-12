'use client'

import Card from '@/components/Card'
import { useProductionSelection } from '@/store/productionSlice'
import { stepActionableTypes } from '@/configs/staticRecords/stepActionableTypes'
import { bprStepActionableStatuses } from '@/configs/staticRecords/bprStepActionableStatuses'
import BooleanActionableInput from './_actionables/BooleanActionableInput'
import NumericActionableInput from './_actionables/NumericActionableInput'
import PhotoActionableInput from './_actionables/PhotoActionableInput'
import TextActionableInput from './_actionables/TextActionableInput'

const StepActionables = () => {
  const { selectedStep } = useProductionSelection()

  if (!selectedStep) return null

  const actionables = selectedStep.bprStepActionables.filter(
    a => a.stepActionable.actionableTypeId !== stepActionableTypes.completeStep
  )

  if (actionables.length === 0) return null

  return (
    <Card.Root>
      <Card.Title>Step Actionables</Card.Title>

      <div className='flex flex-col gap-4'>
        {actionables.map(actionable => {
          const type = actionable.stepActionable.actionableType
          const isComplete = actionable.statusId === bprStepActionableStatuses.completed
            || actionable.statusId === bprStepActionableStatuses.primaryVerification
            || actionable.statusId === bprStepActionableStatuses.secondaryVerification
          const completion = actionable.completion?.[0]
          const config = (type.config ?? null) as Record<string, unknown> | null

          return (
            <div key={actionable.id} className='border border-base-300 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div>
                  <div
                    className='inline-block px-2 py-0.5 rounded text-xs font-semibold mr-2'
                    style={{ backgroundColor: type.bgColor, color: type.textColor }}
                  >
                    {type.dataType}
                  </div>
                  <span className='font-poppins font-semibold'>{type.name}</span>
                </div>
                {isComplete && (
                  <span className='badge badge-success'>Done</span>
                )}
              </div>

              {type.description && (
                <div className='text-sm text-base-content/70 mb-3'>{type.description}</div>
              )}

              {isComplete && completion ? (
                <div className='text-sm bg-base-200 rounded p-2'>
                  <div><span className='font-semibold'>Value:</span> {renderValue(type.dataType, completion.value, completion.files)}</div>
                  <div className='text-xs text-base-content/60 mt-1'>
                    By {completion.completedByUser.name} at {new Date(completion.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                renderInput(type.dataType, actionable.id, config)
              )}
            </div>
          )
        })}
      </div>
    </Card.Root>
  )
}

const renderInput = (dataType: string, actionableId: string, config: Record<string, unknown> | null) => {
  switch (dataType) {
    case 'boolean':
      return <BooleanActionableInput actionableId={actionableId} />
    case 'numeric':
      return <NumericActionableInput actionableId={actionableId} config={config} />
    case 'photo':
      return <PhotoActionableInput actionableId={actionableId} config={config} />
    case 'text':
      return <TextActionableInput actionableId={actionableId} config={config} />
    default:
      return <div className='text-error text-sm'>Unknown actionable type: {dataType}</div>
  }
}

const renderValue = (
  dataType: string,
  value: string,
  files: { file: { id: string; name: string } }[],
) => {
  if (dataType === 'boolean') return value === 'true' ? '✓' : value
  if (dataType === 'photo') {
    if (files.length === 0) return '(no files)'
    return files.map(f => f.file.name).join(', ')
  }
  return value
}

export default StepActionables
