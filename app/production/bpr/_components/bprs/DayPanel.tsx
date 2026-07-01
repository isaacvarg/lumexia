"use client"
import { BatchProductionRecord } from '@/types/batchProductionRecord'
import { DateTime } from 'luxon'
import React from 'react'
import BprCard from './BprCard'

const DayPanel = ({
  bprs,
  day
}: {
  bprs: BatchProductionRecord[],
  day: {
    day: string,
    date: string,
    bg: string
  }
}) => {


  return (

    <div className={`card h-full ${day.bg}`}>
      <div className='card-body p-4 gap-0'>
        <span className='flex flex-row gap-x-2 font-poppins font-semibold text-2xl'>
          <h1 className='text-base-content'>{DateTime.fromISO(day.date).toFormat('dd')}</h1>
          <h1 className='text-base-content/60'>{day.day}</h1>
        </span>

        <div className='py-4 flex flex-col h-full w-full gap-y-2'>
          {bprs && bprs.map((bpr) => <BprCard key={bpr.id} bpr={bpr} />)}
        </div>
      </div>
    </div >
  )
}

export default DayPanel
