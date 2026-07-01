'use client'
import React, { useState } from 'react'
import { DateTime } from 'luxon'
import { useTranslation } from '@/hooks/useTranslation'
import SectionTitle from '@/components/Text/SectionTitle'
import { translationsBprProduction } from '../../_configs/translations'
import DayPanel from './DayPanel'
import TimelineWeek from './TimelineWeek'
import SpanModeToggle from './SpanModeToggle'
import { ProducibleBpr } from '../../_actions/getProducibleBprs'
import { coversDate, DEFAULT_SPAN_DISPLAY, isSpanDisplay, isStartDate, SpanDisplay, WeekDay } from './spanUtils'

// The four production days, tinted progressively darker.
const DAY_DEFS: { key: keyof typeof translationsBprProduction; bg: string; offset: number }[] = [
  { key: 'monday', bg: 'bg-accent/20', offset: 0 },
  { key: 'tuesday', bg: 'bg-accent/35', offset: 1 },
  { key: 'wednesday', bg: 'bg-accent/50', offset: 2 },
  { key: 'thursday', bg: 'bg-accent/65', offset: 3 },
]

const Bprs = ({ bprs, spanDisplay }: { bprs: ProducibleBpr[]; spanDisplay?: string }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<SpanDisplay>(
    isSpanDisplay(spanDisplay) ? spanDisplay : DEFAULT_SPAN_DISPLAY
  )

  const buildWeekDays = (weekOffset: number): WeekDay[] =>
    DAY_DEFS.map(def => ({
      day: t(translationsBprProduction, def.key),
      bg: def.bg,
      date: getDate(def.offset, weekOffset) as string,
    }))

  const thisWeek = buildWeekDays(0)
  const nextWeek = buildWeekDays(1)

  return (
    <div className='flex flex-col gap-y-6'>
      <div className='flex justify-end'>
        <SpanModeToggle mode={mode} onChange={setMode} />
      </div>

      <WeekSection title={t(translationsBprProduction, 'titleThisWeek')} days={thisWeek} bprs={bprs} mode={mode} />
      <WeekSection title={t(translationsBprProduction, 'titleNextWeek')} days={nextWeek} bprs={bprs} mode={mode} />
    </div>
  );
}

const WeekSection = ({
  title,
  days,
  bprs,
  mode,
}: {
  title: string
  days: WeekDay[]
  bprs: ProducibleBpr[]
  mode: SpanDisplay
}) => (
  <div className='flex flex-col gap-y-6'>
    <SectionTitle>{title}</SectionTitle>

    {mode === 'timeline' ? (
      <TimelineWeek days={days} bprs={bprs} />
    ) : (
      <div className='grid grid-cols-4 gap-4'>
        {days.map(day => {
          const entries = bprs
            .filter(bpr => coversDate(bpr, day.date))
            .map(bpr => ({ bpr, isStart: isStartDate(bpr, day.date) }))
          return <DayPanel key={day.day} day={day} entries={entries} mode={mode} />
        })}
      </div>
    )}
  </div>
)

export const getDate = (dayOfWeek: number, weekOffset: number = 0) => {
  return DateTime.now().plus({ weeks: weekOffset }).startOf('week').plus({ days: dayOfWeek }).toISODate();
}

export default Bprs;
