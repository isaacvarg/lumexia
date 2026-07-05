"use status"
import { ExBprStaging } from '@/types/bprStaging'
import React from 'react'
import StagedCard from './StagedCard'

const StagedArea = ({ stagings }: { stagings: ExBprStaging[] }) => {
   
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {stagings.map((staging) => <StagedCard key={staging.id} staging={staging} />)}

    </div>
  )
}

export default StagedArea
