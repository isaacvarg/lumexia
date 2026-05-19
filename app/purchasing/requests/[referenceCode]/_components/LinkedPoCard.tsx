import React from 'react'
import { TbTrash } from 'react-icons/tb'
import { LinkedPos } from '../_functions/getLinkedPos'
import { deleteLinkedPo } from '../_functions/deleteLinkedPos'
import LinkedPoDialog from './LinkedPoDialog'
import useDialog from '@/hooks/useDialog'
import Tag from '@/components/Text/Tag'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'

const LinkedPoCard = ({ po }: { po: LinkedPos, }) => {

  const { showDialog } = useDialog()

  const quantityOnOrderByUom = po.po.purchaseOrderItems.reduce((totals, poItem) => {
    const uom = poItem.uom.abbreviation
    totals[uom] = (totals[uom] ?? 0) + poItem.quantity
    return totals
  }, {} as Record<string, number>)

  const onOrderLabel = Object.entries(quantityOnOrderByUom)
    .map(([uom, quantity]) => `${toFracitonalDigits.weight(quantity)} ${uom}`)
    .join(', ')

  const handleDelete = async (e: any) => {
    e.stopPropagation();
    await deleteLinkedPo(po.id, po.requestId)
  }

  const handleClick = () => {
    showDialog(`linkedPoDialog-${po.po.purchaseOrderItems[0].id}`)
  }

  return (
    <div className='card bg-base-200 hover:cursor-pointer hover:bg-base-300' onClick={handleClick}>
      <LinkedPoDialog purchaseOrder={po} />
      <div className='card-body'>
        <div className='flex justify-between'>
          <div className='card-title'>PO# {po.po.referenceCode} - {po.po.supplier.name} </div>
          <button className='btn btn-circle btn-sm btn-error btn-outline' onClick={(e) => handleDelete(e)}><TbTrash className='size-4' /></button>
        </div>
        <div className='flex flex-col gap-2 items-start'>
          <Tag
            label={po.po.status.name}
            bgColor={po.po.status.bgColor}
            textColor={po.po.status.textColor}
          />
          <div className='font-inter text-base font-medium'>{onOrderLabel ? `${onOrderLabel} on order` : 'Nothing on order'}</div>
        </div>
      </div>
    </div>
  )
}

export default LinkedPoCard
