import { productionConfigs } from '@/configs/data/productionConfigs'
import { ExBprBom } from '@/types/bprBom'
import { BprStaging } from '@/types/bprStaging'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import React from 'react'

type Props = {
  bomItem: ExBprBom
  staged: BprStaging[]
}

const QuantitiesPanel = ({ bomItem, staged }: Props) => {
  const requiredQuantity = bomItem.quantity;
  const stagedQuantity = staged.reduce((sum: number, current: BprStaging) => current.quantity + sum, 0)
  const remainingQuantity = requiredQuantity - stagedQuantity

  // determine if remaining is within acceptable tolerance range
  const acceptableQtyLower = requiredQuantity - (requiredQuantity * productionConfigs.compounding.toleranceThreshold)
  const acceptableQtyUpper = requiredQuantity + (requiredQuantity * productionConfigs.compounding.toleranceThreshold)

  const isStagedAcceptable = stagedQuantity >= acceptableQtyLower && stagedQuantity <= acceptableQtyUpper;

  const remainingStatus = isStagedAcceptable ? 'completed' : 'incomplete';

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <QuantityBox title='Required' quantity={requiredQuantity} />
      <QuantityBox title='Staged Quantity' quantity={stagedQuantity} remainingStatus={remainingStatus} />

    </div>
  )
}

const QuantityBox = ({ title, quantity, remainingStatus = 'default' }: { title: string, quantity: number, remainingStatus?: 'incomplete' | 'completed' | 'default' }) => {

  const bgColor = {
    default: 'bg-swirl-100',
    incomplete: 'bg-rose-200',
    completed: 'bg-emerald-200'
  }

  return <div className={`flex flex-col gap-y-4 p-6 ${bgColor[remainingStatus]} rounded-lg items-center justify-center`}>
    <div className='text-2xl font-poppins font-semibold uppercase'>{title}</div>
    <div className='text-3xl font-medium font-poppins'>{toFracitonalDigits.weight(quantity)} </div>

  </div>
}


export default QuantitiesPanel
