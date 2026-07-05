import batchSizeActions from '@/actions/production/batchSizes'
import Dialog from '@/components/Dialog'
import { BatchSize } from '@/types/batchSize'
import React, { useEffect, useState } from 'react'
import { createBpr } from '../../_functions/createBpr'
import useDialog from '@/hooks/useDialog'
import { Item } from '@/types/item'
import { recordStatuses } from '@/configs/staticRecords/recordStatuses'
import { useRouter } from 'next/navigation'

const BatchSizeStep = ({ selectedMbprId, selectedItem }: { selectedMbprId: string | null, selectedItem: Item | null }) => {

  const [sizes, setSizes] = useState<BatchSize[]>([])
  const router = useRouter()
  const { resetDialogContext } = useDialog()

  const handleSizeSelection = async (size: BatchSize) => {

    if (!selectedMbprId) { throw new Error("No MBPR selected.") }

    if (!selectedItem) { throw new Error("No item selected.") }

    const data = {
      size,
      mbprId: selectedMbprId,
      selectedItem,
    }

    await createBpr(data)
    router.refresh()
    resetDialogContext()
    location.reload()


  }

  useEffect(() => {
    const getSizes = async () => {
      if (!selectedMbprId) {
        return
      }

      const sizes = await batchSizeActions.getAll({ mbprId: selectedMbprId, recordStatusId: recordStatuses.active }, ["uom"])
      setSizes(sizes)

    };



    getSizes();
  }, [selectedMbprId])


  return (
    <div>
      <Dialog.Title>Select Batch Size</Dialog.Title>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {sizes.map(s => <div key={s.id} className='flex flex-col bg-primary/45 rounded-lg p-4 font-poppins font-semibold text-primary-content' onClick={() => handleSizeSelection(s)}>
          <div className='flex  gap-y-2'><p>{s.quantity}</p><p>{s.uom.abbreviation}</p></div></div>)}
      </div>

    </div>
  )
}

export default BatchSizeStep
