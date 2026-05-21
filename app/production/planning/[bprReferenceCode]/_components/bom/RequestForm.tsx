import Dialog from '@/components/Dialog'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Form from '@/components/Form'
import { useForm } from 'react-hook-form'
import { BprBomItemInventory } from '@/actions/inventory/inventory/getAllByBom'
import { RequestPriority } from '@/actions/purchasing/requests/priorities/getAll'
import { purchasingActions } from '@/actions/purchasing'


type RequestFormProps = {
  setMode: Dispatch<SetStateAction<"default" | "request" | "audit">>
  material: BprBomItemInventory
  hasRequests: boolean
}

type Inputs = {
  priorityId: string;
  notes?: string;
}

const RequestForm = ({
  setMode,
  material,
  hasRequests,
}: RequestFormProps
) => {

  const form = useForm<Inputs>()
  const [isLoading, setIsLoading] = useState(false);
  const [requestPriorities, setRequestPriorities] = useState<RequestPriority[]>();
  const [isWarningShown, setIsWarningShown] = useState(hasRequests)
  const [wasWarningOverridden, setWasWarningOverridden] = useState(false)



  const handleSubmit = async (data: Inputs) => {
    try {
      await purchasingActions.requests.create(material, data.priorityId, wasWarningOverridden, data.notes);
    } catch (error) {
      throw new Error("Error in creating request.")
    } finally {
      location.reload()
    }
  }

  const handleCancel = () => {
    setMode("default")
  }


  useEffect(() => {
    const getter = async () => {

      try {
        setIsLoading(true)
        const priorities = await purchasingActions.requests.priorities.getAll();
        setRequestPriorities(priorities)
      } catch (error) {
        throw new Error("Priorities could not be loaded.")
      } finally {
        setIsLoading(false)
      }
    }

    getter()
  }, [])

  if (isLoading) {
    return (
      <div className="flex w-52 flex-col gap-4">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-4 w-28"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    )
  }

  if (isWarningShown) {
    return (
      <div className='flex flex-col items-center gap-y-6 justify-center'>

        <div className='text-xl font-bold'>Hold up! There is already one or more active requests for this item. Are you sure you want to add another?</div>

        <div className='flex justify-end gap-x-4'>
          <button
            className='btn btn-info'
            onClick={() => setMode('default')}
          >

            Cancel
          </button>
          <button
            className='btn btn-error'
            onClick={() => {
              setIsWarningShown(false)
              setWasWarningOverridden(true)
            }}

          >Proceed</button>
        </div>

      </div>
    )
  }


  return (
    <div>
      <Dialog.Title>{material.bom.item.name} Request</Dialog.Title>

      <Form.Root form={form} onSubmit={handleSubmit}>

        {requestPriorities && <Form.Select
          form={form}
          label="Priority"
          fieldName='priorityId'
          options={requestPriorities.map((priority) => ({ value: priority.id, label: priority.name }))}
        />}

        <Form.TextArea
          form={form}
          fieldName='notes'
          label='Notes (optional)'
        />

        <div className='flex flex-row gap-x-2 justify-end'>
          <button className="btn btn-neutral btn-soft" onClick={handleCancel}>Back</button>
          <button className='btn bg-success' type='submit'>Submit</button>
        </div>

      </Form.Root>




    </div>
  )
}

export default RequestForm
