'use client'
import { BatchProductionRecord } from '@/types/batchProductionRecord'
import React from 'react'
import DayPanel from './DayPanel'
import { DateTime } from 'luxon'
import { useTranslation } from '@/hooks/useTranslation'
import { translations } from '../../_configs/translations'
import SectionTitle from '@/components/Text/SectionTitle'

const WeeklyPanel = ({ bprs }: { bprs: BatchProductionRecord[] }) => {

  const { t } = useTranslation();
  const productionDaysOfWeek = [
    {
      day: t(translations, 'monday'),
      bg: 'bg-accent/20',
      date: getDate(0)
    },
    {
      day: t(translations, 'tuesday'),
      bg: 'bg-accent/35',
      date: getDate(1),
    },
    {
      day: t(translations, 'wednesday'),
      bg: 'bg-accent/50',
      date: getDate(2),
    },
    {
      day: t(translations, 'thursday'),
      bg: 'bg-accent/65',
      date: getDate(3)
    }
  ];

  const nextProductionDaysOfWeek = [
    {
      day: t(translations, 'monday'),
      bg: 'bg-accent/20',
      date: getDate(0, 1)
    },
    {
      day: t(translations, 'tuesday'),
      bg: 'bg-accent/35',
      date: getDate(1, 1),
    },
    {
      day: t(translations, 'wednesday'),
      bg: 'bg-accent/50',
      date: getDate(2, 1),
    },
    {
      day: t(translations, 'thursday'),
      bg: 'bg-accent/65',
      date: getDate(3, 1)
    }
  ];

  return (


    <div className='flex flex-col gap-y-6'>
      <SectionTitle>        {t(translations, 'weekTitle')}
      </SectionTitle>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {productionDaysOfWeek.map((day) => (
          <DayPanel
            key={day.day}
            day={day}
            bprs={bprs.filter((bpr) => {
              if (!bpr.scheduledForStart) { return false; }
              return DateTime.fromJSDate(bpr.scheduledForStart).toISODate() === DateTime.fromISO(day.date).toISODate();
            }) as any}
          />
        ))}
      </div>

      <SectionTitle>        {t(translations, 'nextWeekTitle')}
      </SectionTitle>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {nextProductionDaysOfWeek.map((day) => (
          <DayPanel
            key={day.day}
            day={day}
            bprs={bprs.filter((bpr) => {
              if (!bpr.scheduledForStart) { return false; }
              return DateTime.fromJSDate(bpr.scheduledForStart).toISODate() === DateTime.fromISO(day.date).toISODate();
            }) as any}
          />
        ))}
      </div>




    </div>
  );
}

export const getDate = (dayOfWeek: number, weekOffset: number = 0) => {
  return DateTime.now().plus({ weeks: weekOffset }).startOf('week').plus({ days: dayOfWeek }).toISODate();
}

export default WeeklyPanel;
