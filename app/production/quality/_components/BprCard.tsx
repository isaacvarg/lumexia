"use client"
import useProduction from '@/hooks/useProduction'
import { useProductionActions } from '@/store/productionSlice'
import { useRouter } from 'next/navigation'
import React from 'react'
import { AwaitingVerificationBpr } from '../_function/getAwaitingVerificationBprs'

const BprCard = ({ bpr, isSecondary = false }: { bpr: AwaitingVerificationBpr, isSecondary: boolean }) => {

  const { setIsSecondaryVerificationMode } = useProduction()
  const { setQualityMode } = useProductionActions()

  const router = useRouter()

  const { overview } = bpr

  const handleClick = () => {
    setIsSecondaryVerificationMode(isSecondary);
    setQualityMode(isSecondary ? 'secondary' : 'primary');
    router.push(`/production/bpr/${bpr.referenceCode}?id=${bpr.id}`)
  }

  return (
    <div onClick={handleClick} className='card card-border border-base-300 shadow-sm hover:shadow-md transition-all cursor-pointer bg-base-100 hover:bg-base-200'>
      <div className="card-body p-4 gap-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="font-bold text-base-content font-poppins text-xl"># {bpr.referenceCode}</h1>
          <span
            style={{ backgroundColor: bpr.status.bgColor, color: bpr.status.textColor }}
            className="badge badge-sm font-medium shrink-0"
          >
            {bpr.status.name}
          </span>
        </div>

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

export default BprCard
