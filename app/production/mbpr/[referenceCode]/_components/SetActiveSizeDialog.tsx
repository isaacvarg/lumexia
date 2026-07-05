'use client'
import { productionActions } from '@/actions/production'
import { Mbpr } from '@/actions/production/mbpr/getOneMbpr'
import Dialog from '@/components/Dialog'
import { recordStatuses } from '@/configs/staticRecords/recordStatuses'
import React from 'react'

type batchSize = Mbpr['BatchSize'][number]

const SetActiveSizeDialog = ({ sizes }: { sizes: batchSize[] }) => {

  const handleClick = async (selectedSize: batchSize) => {

    const toDeactive = sizes.filter((size) => size.id !== selectedSize.id);

    if (toDeactive.length !== 0) {

      const deactivated = toDeactive.map(async (td) => {
        const response = await productionActions.mbprs.batchSizes.update(td.id, { recordStatusId: recordStatuses.inactive })

        return response
      });

      await Promise.all(deactivated)
    }


    await productionActions.mbprs.batchSizes.update(selectedSize.id, { recordStatusId: recordStatuses.active })

    location.reload()

  }
  return (
    <Dialog.Root identifier='selectActiveBatchSize'>
      <div className='flex flex-col gap-y-8'>
        <Dialog.Title>Active Batch Size</Dialog.Title>

        <p className='font-poppins font-normal text-lg text-base-content'>
          A MBPR can have multiple batch sizes. However, there can only be one active batch size at a time. This restriction allows for functionality such as pricing, trends, and avoid confusion.
        </p>


        <p className='font-poppins font-normal text-lg text-base-content'>
          Please select from the following sizes. To add more modify the MBPR beforehand
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sizes.map((size) => {
            return (
              <div key={size.id}

                onClick={() => handleClick(size)}
                className="flex flex-col gap-y-4 hover:bg-secondary/40 hover:cursor-pointer bg-base-200 p-8 rounded-xl ">

                <h1 className="font-poppins font-semibold text-xl text-base-content">

                  {size.quantity} lbs
                </h1>

              </div>

            )
          })}

        </div>


      </div>


    </Dialog.Root>
  )
}

export default SetActiveSizeDialog
