"use client"

import useDialog from '@/hooks/useDialog'
import { useRouter } from 'next/navigation'
import { DateTime } from 'luxon'
import React from 'react'
import { ProducibleBpr } from '../../_actions/getProducibleBprs'

const classes = {
  bg: {
    default: 'bg-base-100 hover:bg-base-200',
    darker: 'bg-base-200 hover:bg-base-300'
  }
}

type BprCardProps = {
  bpr: ProducibleBpr
  bg?: keyof typeof classes.bg
  isInactive?: boolean
  // When true, show a start→end range badge for multi-day BPRs (compact mode).
  showSpan?: boolean
}

const useOpenBpr = (bpr: ProducibleBpr, isInactive: boolean) => {
  const router = useRouter()
  const { showDialog } = useDialog()
  return () => {
    if (isInactive) {
      showDialog('noScheduleDate')
      return;
    }
    router.push(`/production/bpr/${bpr.referenceCode}?id=${bpr.id}`)
  }
}

const StatusBadge = ({ bpr }: { bpr: ProducibleBpr }) => (
  <span
    style={{ backgroundColor: bpr.status.bgColor, color: bpr.status.textColor }}
    className="badge badge-sm font-medium shrink-0"
  >
    {bpr.status.name}
  </span>
)

const spanLabel = (bpr: ProducibleBpr): string | null => {
  if (!bpr.scheduledForStart || !bpr.scheduledForEnd) return null
  const start = DateTime.fromJSDate(bpr.scheduledForStart).startOf('day')
  const end = DateTime.fromJSDate(bpr.scheduledForEnd).startOf('day')
  if (start.equals(end)) return null
  return `${start.toFormat('ccc')} → ${end.toFormat('ccc')}`
}

const BprCard = ({ bpr, bg = 'default', isInactive = false, showSpan = false }: BprCardProps) => {
  const handleClick = useOpenBpr(bpr, isInactive)
  const { overview } = bpr
  const range = showSpan ? spanLabel(bpr) : null

  return (
    <div onClick={handleClick} className={`card card-border border-base-300 shadow-sm hover:shadow-md transition-all cursor-pointer ${classes.bg[bg]} ${isInactive ? 'opacity-60' : ''}`}>
      <div className="card-body p-4 gap-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="font-bold text-base-content font-poppins text-xl"># {bpr.referenceCode}</h1>
          <StatusBadge bpr={bpr} />
        </div>

        {range && <span className="badge badge-ghost badge-sm font-medium self-start">{range}</span>}

        <h1 className="font-bold text-base-content font-poppins text-2xl leading-tight">{bpr.mbpr.producesItem.name}</h1>

        {bpr.lotOrigin && <span className="text-base-content/60 font-poppins text-sm font-medium">{bpr.lotOrigin.lot?.lotNumber}</span>}

        {overview && (
          <div className="flex flex-col gap-2 border-t border-base-content/10 pt-2 mt-1">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="opacity-70">Waiting on:</span>
              <span className="badge badge-neutral badge-sm font-medium">{overview.teamLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <progress
                className="progress progress-success flex-1"
                value={overview.completed}
                max={overview.total || 1}
              />
              <span className="text-sm text-base-content/70 shrink-0">
                {overview.completed}/{overview.total}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact one-line continuation marker for days a multi-day BPR spans into.
export const BprChip = ({ bpr, isInactive = false }: { bpr: ProducibleBpr; isInactive?: boolean }) => {
  const handleClick = useOpenBpr(bpr, isInactive)
  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-md bg-base-100/70 hover:bg-base-200 border border-base-300 px-2 py-1 cursor-pointer ${isInactive ? 'opacity-60' : ''}`}
    >
      <span
        style={{ backgroundColor: bpr.status.bgColor }}
        className="w-2 h-2 rounded-full shrink-0"
      />
      <span className="text-sm font-medium text-base-content truncate">
        # {bpr.referenceCode} · {bpr.mbpr.producesItem.name}
      </span>
    </div>
  )
}

export default BprCard
