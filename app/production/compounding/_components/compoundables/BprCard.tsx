"use client"

import useDialog from '@/hooks/useDialog'
import { BatchProductionRecord } from '@/types/batchProductionRecord'
import { useRouter } from 'next/navigation'
import React from 'react'

const classes = {
  bg: {
    default: 'bg-base-100 hover:bg-base-200',
    darker: 'bg-base-200 hover:bg-base-300'
  }
}

type BprCardProps = {
  bpr: BatchProductionRecord
  bg?: keyof typeof classes.bg
  isInactive?: boolean
}

const BprCard = ({ bpr, bg = 'default', isInactive = false }: BprCardProps) => {
  const router = useRouter()
  const { showDialog } = useDialog()

  const handleClick = () => {
    if (isInactive) {
      showDialog('noScheduleDate')
      return;
    }
    router.push(`/production/compounding/${bpr.referenceCode}?id=${bpr.id}`)
  }
  return (
    <div onClick={() => handleClick()} className={`card card-border border-base-300 shadow-sm hover:shadow-md transition-all cursor-pointer ${classes.bg[bg]} ${isInactive ? 'opacity-60' : ''}`}>
      <div className="card-body p-4 gap-y-2">
        <h1 className="font-bold text-base-content font-poppins text-xl"># {bpr.referenceCode} </h1>

        {bpr.lotOrigin && <h1 className="font-bold text-base-content font-poppins text-xl">{bpr.lotOrigin.lot?.lotNumber} </h1>}

        <h1 className="font-bold text-base-content font-poppins text-xl">{bpr.mbpr.producesItem.name} </h1>
      </div>
    </div>

  )
}

export default BprCard
