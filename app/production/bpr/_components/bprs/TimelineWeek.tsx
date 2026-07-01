"use client"
import { DateTime } from 'luxon'
import React from 'react'
import BprCard from './BprCard'
import { ProducibleBpr } from '../../_actions/getProducibleBprs'
import { getSpanRange, WeekDay } from './spanUtils'

// Calendar/gantt-style week: each BPR renders as a single bar spanning the day
// columns its schedule covers, one BPR per row (no duplication).
const TimelineWeek = ({ days, bprs }: { days: WeekDay[]; bprs: ProducibleBpr[] }) => {
  const rows = bprs
    .map(bpr => ({ bpr, range: getSpanRange(bpr, days) }))
    .filter((row): row is { bpr: ProducibleBpr; range: { startIdx: number; endIdx: number } } => row.range !== null)

  return (
    <div className='flex flex-col gap-2'>
      {/* Day header */}
      <div className='grid grid-cols-4 gap-2'>
        {days.map(day => (
          <div key={day.day} className={`rounded-md px-3 py-2 ${day.bg}`}>
            <span className='flex flex-row gap-x-2 font-poppins font-semibold text-xl'>
              <span className='text-base-content'>{DateTime.fromISO(day.date).toFormat('dd')}</span>
              <span className='text-base-content/60'>{day.day}</span>
            </span>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className='text-base-content/50 text-sm px-1 py-2'>No batches scheduled.</div>
      )}

      {/* One row per BPR, bar positioned across the covered columns */}
      {rows.map(({ bpr, range }) => (
        <div key={bpr.id} className='grid grid-cols-4 gap-2'>
          <div style={{ gridColumn: `${range.startIdx + 1} / ${range.endIdx + 2}` }}>
            <BprCard bpr={bpr} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TimelineWeek
