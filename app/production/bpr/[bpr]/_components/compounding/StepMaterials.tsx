'use client'

import Card from "@/components/Card"
import { useTranslation } from "@/hooks/useTranslation"
import { useProductionSelection } from "@/store/productionSlice"
import { translations } from "../../_configs/translations"
import { handleCheckOffBomLine } from "../../_actions/compounding/handleCheckOffBomLine"
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses"
import { useRouter } from "next/navigation"
import { useState } from "react"

const StepMaterials = () => {

  const { selectedStep } = useProductionSelection()
  const { t } = useTranslation()
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)

  if (!selectedStep) {
    return null
  }

  const handleCheck = async (bprBomId: string) => {
    setPendingId(bprBomId)
    try {
      await handleCheckOffBomLine(bprBomId)
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card.Root>

      <Card.Title>{t(translations, 'compoundingMaterialsTitle')}</Card.Title>

      <div className="grid grid-cols-2 gap-4">

        {selectedStep.bprBomLines.map(line => {
          const isChecked = !!line.addedAt
          const isReady = line.statusId === bprBomLineStatuses.secondaryVerified
          const isDisabled = isChecked || !isReady || pendingId === line.id

          return (
            <label
              key={line.id}
              className={`bg-primary/35 rounded-xl p-4 shadow-sm flex flex-col gap-y-2 items-center justify-center ${isDisabled && !isChecked ? 'opacity-60' : ''} ${isChecked ? 'bg-success/40' : ''}`}
            >
              <div className="flex items-center gap-3 w-full justify-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-lg"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => !isDisabled && handleCheck(line.id)}
                />
                <div className="flex flex-col items-center">
                  <div className="font-poppins font-semibold text-xl text-base-content">{line.bom.identifier}</div>
                  <div className="font-poppins font-medium text-xl text-base-content">{line.bom.item.name}</div>
                </div>
              </div>
              {isChecked && line.addedByUser && (
                <div className="text-xs text-base-content/70">
                  Added by {line.addedByUser.name} {line.addedAt ? `at ${new Date(line.addedAt).toLocaleString()}` : ''}
                </div>
              )}
              {!isReady && !isChecked && (
                <div className="text-xs text-warning-content/70">
                  Awaiting verification
                </div>
              )}
            </label>
          )
        })}

      </div>


    </Card.Root>

  )
}

export default StepMaterials
