import Card from '@/components/Card'
import { ExBprBom } from '@/types/bprBom'
import React from 'react'
import ItemCard from './ItemCard'
import Confetti from '@/components/Confetti/Confetti'
import { bprBomLineStatuses } from '@/configs/staticRecords/bprBomLineStatuses'

const NotStartedPanel = ({ bom }: { bom: ExBprBom[] }) => {

  const notStartedBomItems = bom.filter((bomItem) => bomItem.statusId === bprBomLineStatuses.pending);

  return (
    <Card.Root>
      <Card.Title>Not Started</Card.Title>
      {notStartedBomItems.length === 0 && <Confetti />}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {notStartedBomItems.map((item) => <ItemCard key={item.id} bomItem={item} />)}

      </div>

    </Card.Root>
  )
}

export default NotStartedPanel
