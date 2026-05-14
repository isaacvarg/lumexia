'use client'
import Dialog from "@/components/Dialog"
import { useItemSelection } from "@/store/itemSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { inventoryTypes } from "@/configs/staticRecords/inventoryTypes"
import { MbprBomItemInventory } from "@/actions/inventory/inventory/getAllByMbprBom"
import { LuCheck, LuAlertTriangle, LuX } from "react-icons/lu"

export const MATERIALS_AVAILABILITY_DIALOG = 'materialsAvailability'

const Row = ({ line }: { line: MbprBomItemInventory }) => {
  const isConsumable = line.item.inventoryTypeId === inventoryTypes.notTracked
  const isSufficient = isConsumable || line.totalQuantityAvailable >= line.requiredQuantity
  const isSoftSufficient = isConsumable || line.totalQuantitySoftAvailability >= line.requiredQuantity
  const rowClass = !isSufficient ? 'bg-red-300' : !isSoftSufficient ? 'bg-yellow-200' : ''
  const available = isConsumable ? 'Consumable' : toFracitonalDigits.weight(line.totalQuantityAvailable)
  const softAvailability = isConsumable ? 'Consumable' : toFracitonalDigits.weight(line.totalQuantitySoftAvailability)

  return (
    <tr className={rowClass}>
      <th>{line.identifier}</th>
      <td>{line.item?.name || ''}</td>
      <td>{toFracitonalDigits.weight(line.requiredQuantity)}</td>
      <td>{available}</td>
      <td>{toFracitonalDigits.weight(line.totalQuantitySoftAllocated)}</td>
      <td>{softAvailability}</td>
      <td>
        {!isSufficient
          ? <LuX className="text-red-700 w-6 h-6" />
          : !isSoftSufficient
            ? <LuAlertTriangle className="text-yellow-700 w-6 h-6" />
            : <LuCheck className="text-green-700 w-6 h-6" />
        }
      </td>
    </tr>
  )
}

const MaterialsAvailabilityDialog = () => {
  const { mbprBomInventory } = useItemSelection()

  const sorted = [...mbprBomInventory].sort(
    (a, b) => parseInt(a.identifier) - parseInt(b.identifier)
  )

  return (
    <Dialog.Root identifier={MATERIALS_AVAILABILITY_DIALOG}>
      <Dialog.Title>Materials Availability for Next Batch</Dialog.Title>
      <div className="flex gap-4 text-sm mt-2 text-base-content/70">
        <span><span className="inline-block w-3 h-3 bg-red-300 align-middle mr-1" /> Insufficient now</span>
        <span><span className="inline-block w-3 h-3 bg-yellow-200 align-middle mr-1" /> Insufficient if drafts confirm</span>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Material Name</th>
              <th>Required (lb)</th>
              <th>Available (lb)</th>
              <th>Soft Allocated (lb)</th>
              <th>Soft Availability (lb)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(line => <Row key={line.id} line={line} />)}
          </tbody>
        </table>
      </div>
    </Dialog.Root>
  )
}

export default MaterialsAvailabilityDialog
