import { ExBprStaging } from '@/types/bprStaging'
import React from 'react'
import StagedEntryCard from './StagedEntryCard'
import ActionPanel from '@/components/ActionPanel'
import { ExBprBom } from '@/types/bprBom'
import { updateBomItem } from '../_functions/updateBomItem'
import { useRouter } from 'next/navigation'
import { productionConfigs } from '@/configs/data/productionConfigs'
import { bprBomLineStatuses } from '@/configs/staticRecords/bprBomLineStatuses'


const ScanHistory = ({ setIsViewMode, stagings, bomItem }: { setIsViewMode: (isViewMode: boolean) => void, stagings: any, bomItem: ExBprBom }) => {


  const stagedQuantity = stagings.reduce((sum: number, current: ExBprStaging) => current.quantity + sum, 0)
  const requiredQuantity = bomItem.quantity;
  const router = useRouter()


  // determine if remaining is within acceptable tolerance range
  const acceptableQtyLower = requiredQuantity - (requiredQuantity * productionConfigs.compounding.toleranceThreshold)
  const acceptableQtyUpper = requiredQuantity + (requiredQuantity * productionConfigs.compounding.toleranceThreshold)

  const isStagedAcceptable = stagedQuantity >= acceptableQtyLower && stagedQuantity <= acceptableQtyUpper;

  const handleAdd = () => {
    setIsViewMode(false)
  }

  const handleComplete = () => {

    const payload = {
      statusId: bprBomLineStatuses.staged,
    }

    updateBomItem(payload, bomItem.id)
    router.back()
  }
  return (
    <div className='flex flex-col gap-y-4'>

      {bomItem.statusId === bprBomLineStatuses.pending && <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <ActionPanel onClick={() => handleAdd()}>
          Add New
        </ActionPanel>
        {isStagedAcceptable &&
          <ActionPanel onClick={() => handleComplete()}>
            Complete Staging
          </ActionPanel>
        }

      </div>}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {stagings.map((entry: ExBprStaging) => <StagedEntryCard key={entry.id} entry={entry} />)}
      </div>
    </div>
  )
}

export default ScanHistory
