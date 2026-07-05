"use client"
import React from 'react'
import { LinkedBatchesType } from '../_functions/getLinkedBatches'
import LinkedBprCard from './LinkedBprCard'
import useDialog from '@/hooks/useDialog'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import { LinkedBprsAmounts } from '../_functions/getLinkedBprAmounts'
import SectionTitle from '@/components/Text/SectionTitle'
import { TbPlugConnected } from 'react-icons/tb'
import Card from '@/components/Card'

type LinkedBprsPanelProps = {
  bprs: LinkedBatchesType
  linkedBprAmounts: LinkedBprsAmounts
}

const LinkedBatchesPanel = ({ bprs, linkedBprAmounts }: LinkedBprsPanelProps) => {

  const { showDialog } = useDialog()

  const handleAdd = () => {
    showDialog('actionLinkBprToPurchasingRequest')
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between items-end'>
        <SectionTitle>Linked Batches</SectionTitle>
        <button className='btn btn-secondary' onClick={handleAdd}>
          <span className='text-xl'> <TbPlugConnected /></span>
          <h2>Connect Existing</h2>
        </button>
      </div>


      <Card.Root>


        <div className="grow grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bprs.map((bpr) => (
            <LinkedBprCard key={bpr.id} bpr={bpr} />
          ))}
        </div>

        <div className="flex justify-end font-poppins text-sm font-medium">
          Total: {toFracitonalDigits.weight(linkedBprAmounts.totalNeeded)} lbs
        </div>
      </Card.Root >
    </div >

  )
}

export default LinkedBatchesPanel
