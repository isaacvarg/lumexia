import { PurchasedItem } from '@/actions/inventory/getPurchasedItems';
import Search from '@/components/Search/Search'
import React, { Dispatch, SetStateAction, useState } from 'react'
import ScanListener from './ScanListener';
import GeneralRequests from './GeneralRequests';

type ItemStepProps = {
  items: PurchasedItem[];
  nextStep: () => void;
  setItem: Dispatch<SetStateAction<string>>
  currentStep: number
}
const ItemStep = ({ items, nextStep, currentStep, setItem }: ItemStepProps) => {

  const handleItemSelection = (value: string) => {
    setItem(value);
    nextStep()
  }

  if (currentStep !== 0) {
    return null
  }
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      <Search
        data={items}
        keys={['name', 'aliases']}
        onClick={handleItemSelection}
      />

      <GeneralRequests />


      <ScanListener handleItemSelection={handleItemSelection} />
    </div>
  )
}

export default ItemStep
