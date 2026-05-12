'use client'

import Card from '@/components/Card'
import { useBprDetailsSelection } from '@/store/bprDetailsSlice'
import { bprStepActionableStatuses } from '@/configs/staticRecords/bprStepActionableStatuses'
import { BprPlanningStep } from '../../_functions/getStepsWithCompletions'

const StepsTab = () => {
  const { steps } = useBprDetailsSelection()

  if (!steps || steps.length === 0) {
    return (
      <Card.Root>
        <Card.Title>Step Actionables</Card.Title>
        <div className='text-base-content/60'>No steps loaded.</div>
      </Card.Root>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {steps.map(step => {
        const hasActionables = step.bprStepActionables.length > 0

        return (
          <Card.Root key={step.id}>
            <div className='flex items-center justify-between'>
              <Card.Title>
                {step.batchStep.sequence}. {step.batchStep.label || step.batchStep.phase}
              </Card.Title>
              <span className='text-sm text-base-content/60'>{step.status.name}</span>
            </div>

            {!hasActionables ? (
              <div className='text-sm text-base-content/60'>No actionables for this step.</div>
            ) : (
              <div className='flex flex-col gap-3'>
                {step.bprStepActionables.map(actionable => {
                  const type = actionable.stepActionable.actionableType
                  const completion = actionable.completion[0]
                  const isNotStarted = actionable.statusId === bprStepActionableStatuses.notStarted

                  return (
                    <div key={actionable.id} className='border border-base-300 rounded-lg p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span
                            className='inline-block px-2 py-0.5 rounded text-xs font-semibold'
                            style={{ backgroundColor: type.bgColor, color: type.textColor }}
                          >
                            {type.dataType}
                          </span>
                          <span className='font-poppins font-semibold'>{type.name}</span>
                        </div>
                        <span className='badge'>{actionable.status.name}</span>
                      </div>

                      {!completion && isNotStarted && (
                        <div className='text-sm text-base-content/60'>Not yet submitted.</div>
                      )}

                      {completion && (
                        <div className='text-sm bg-base-200 rounded p-3 flex flex-col gap-2'>
                          <ValueDisplay dataType={type.dataType} completion={completion} />
                          <div className='text-xs text-base-content/60'>
                            By {completion.completedByUser.name} at{' '}
                            {new Date(completion.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card.Root>
        )
      })}
    </div>
  )
}

type Completion = BprPlanningStep['bprStepActionables'][number]['completion'][number]

const ValueDisplay = ({ dataType, completion }: { dataType: string; completion: Completion }) => {
  if (dataType === 'photo') {
    const files = (completion.files ?? []) as Array<{ url?: string; file: { id: string; name: string } }>
    if (files.length === 0) return <div>(no files)</div>
    return (
      <div className='flex flex-wrap gap-2'>
        {files.map(f => (
          <a
            key={f.file.id}
            href={f.url}
            target='_blank'
            rel='noreferrer'
            className='block'
            title={f.file.name}
          >
            {f.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt={f.file.name} className='h-24 w-24 object-cover rounded border border-base-300' />
            ) : (
              <span className='underline'>{f.file.name}</span>
            )}
          </a>
        ))}
      </div>
    )
  }

  if (dataType === 'boolean') {
    return <div><span className='font-semibold'>Value:</span> {completion.value === 'true' ? '✓ Yes' : completion.value}</div>
  }

  return <div><span className='font-semibold'>Value:</span> {completion.value}</div>
}

export default StepsTab
