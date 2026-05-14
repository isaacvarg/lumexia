'use client'
import { useState } from "react"
import { inventoryActions } from "@/actions/inventory"
import useDialog from "@/hooks/useDialog"
import { useItemActions, useItemSelection } from "@/store/itemSlice"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import { MATERIALS_AVAILABILITY_DIALOG } from "./MaterialsAvailabilityDialog"

const CheckMaterialsButton = () => {
  const { activeMbpr } = useItemSelection()
  const { setMbprBomInventory } = useItemActions()
  const { showDialog } = useDialog()
  const [isLoading, setIsLoading] = useState(false)

  const activeBatchSize = activeMbpr?.BatchSize.find(bz => bz.recordStatusId === recordStatuses.active)
  const isDisabled = !activeMbpr || !activeBatchSize || isLoading

  const handleClick = async () => {
    if (!activeMbpr) return
    setIsLoading(true)
    try {
      const data = await inventoryActions.inventory.getAllByMbprBom(activeMbpr)
      setMbprBomInventory(data)
      showDialog(MATERIALS_AVAILABILITY_DIALOG)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button className="btn btn-primary" onClick={handleClick} disabled={isDisabled}>
      {isLoading ? 'Checking...' : 'Check Materials Availability'}
    </button>
  )
}

export default CheckMaterialsButton
