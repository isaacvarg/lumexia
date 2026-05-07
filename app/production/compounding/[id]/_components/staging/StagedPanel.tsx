import Card from '@/components/Card'
import { ExBprBom } from '@/types/bprBom'
import React from 'react'
import ItemCard from './ItemCard'
import { bprBomLineStatuses } from '@/configs/staticRecords/bprBomLineStatuses'

const StagedPanel = ({ bom }: { bom: ExBprBom[] }) => {
  return (
    <Card.Root>
      <Card.Title>Staged</Card.Title>
      <div className='grid grid-cols-4 gap-4'>
        {bom.filter((bomItem) => bomItem.statusId !== bprBomLineStatuses.pending).map((item) => <ItemCard key={item.id} bomItem={item} />)}
      </div>

    </Card.Root>
  )
}

export default StagedPanel 
