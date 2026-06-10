"use client"
import React from 'react'
import useDialog from '@/hooks/useDialog'
import { LinkedPos } from '../_functions/getLinkedPos'
import LinkedPoCard from './LinkedPoCard'
import { TbPlugConnected, TbPlus } from 'react-icons/tb'
import { LinkedPoAmounts } from '../_functions/getLinkedPoAmounts'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import Card from '@/components/Card'
import SectionTitle from '@/components/Text/SectionTitle'

type LinkedPosPanelProps = {
  pos: LinkedPos[]
  linkedPosAmounts: LinkedPoAmounts
}

const LinkedPosPanel = ({ pos, linkedPosAmounts }: LinkedPosPanelProps) => {

  const { showDialog } = useDialog()


  const handleAdd = () => {
    showDialog('actionLinkPosToPurchasingRequest')
  }


  return (
    <div className='flex flex-col gap-2'>

      <div className='flex items-end justify-between'>
        <SectionTitle>Linked POs</SectionTitle>        <div className='flex gap-x-2'>
          <button className='btn btn-secondary' onClick={handleAdd}>
            <span className='text-xl'> <TbPlugConnected /></span>
            <h2>Connect Existing</h2>
          </button>
          <button className='btn btn-secondary' onClick={() => showDialog('newPOFromRequest')}>
            <span className='text-xl'> <TbPlus /></span>
            <h2>Add New</h2>
          </button>
        </div>
      </div>


      <Card.Root>
        <div className="grow grid grid-cols-2 gap-4">
          {pos.map((po) => <LinkedPoCard key={po.id} po={po} />)}
        </div>


        <div className="flex justify-end font-poppins text-sm font-medium">
          Total: {toFracitonalDigits.weight(linkedPosAmounts.totalPurchased)} lbs
        </div>
      </Card.Root>
    </div>
  )
}

export default LinkedPosPanel
