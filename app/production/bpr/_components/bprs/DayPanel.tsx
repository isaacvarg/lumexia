"use client"
import { DateTime } from 'luxon'
import React from 'react'
import BprCard, { BprChip } from './BprCard'
import { ProducibleBpr } from '../../_actions/getProducibleBprs'
import { SpanDisplay, WeekDay } from './spanUtils'

export type DayEntry = {
  bpr: ProducibleBpr
  isStart: boolean
}

const DayPanel = ({
  entries,
  day,
  mode,
}: {
  entries: DayEntry[]
  day: WeekDay
  mode: Exclude<SpanDisplay, 'timeline'>
}) => {
  // In compact mode a multi-day BPR only appears on its start day.
  const visible = mode === 'compact' ? entries.filter(e => e.isStart) : entries

  return (
    <div className={`card h-full ${day.bg}`}>
      <div className='card-body p-4 gap-0'>
        <span className='flex flex-row gap-x-2 font-poppins font-semibold text-2xl'>
          <h1 className='text-base-content'>{DateTime.fromISO(day.date).toFormat('dd')}</h1>
          <h1 className='text-base-content/60'>{day.day}</h1>
        </span>

        <div className='py-4 flex flex-col h-full w-full gap-y-2'>
          {visible.map(({ bpr, isStart }) =>
            mode === 'chips' && !isStart
              ? <BprChip key={bpr.id} bpr={bpr} />
              : <BprCard key={bpr.id} bpr={bpr} showSpan={mode === 'compact'} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DayPanel
