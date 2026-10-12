'use client'
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TbAlertTriangle, TbTruckDelivery } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import type { ItemExpectations, ReceivingFileType } from "@/lib/receiving/queries"
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import SectionTitle from "@/components/Text/SectionTitle"
import ReceiveFlow from "./receive/ReceiveFlow"

type Props = {
  purchaseOrder: { id: string; referenceCode: number; supplierName: string }
  items: PurchaseOrderItem[]
  expectations: ItemExpectations[]
  fileTypes: ReceivingFileType[]
}

// The lines still expected on the PO. The receiver taps the ones in this delivery, then walks through
// inspection, supplier lots and documents for each.
const ReceivePanel = ({ purchaseOrder, items, expectations, fileTypes }: Props) => {
  const router = useRouter()
  const receivable = useMemo(
    () => items.filter((i) => i.purchaseOrderStatusId === purchaseOrderStatuses.confirmedAwaitingDelivery || i.purchaseOrderStatusId === purchaseOrderStatuses.partiallyReceived),
    [items]
  )
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [receiving, setReceiving] = useState<PurchaseOrderItem[] | null>(null)

  const selectable = receivable.filter((i) => !i.hasConversionError)
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const allSelected = selectable.length > 0 && selectable.every((i) => selected.has(i.id))

  const start = () => setReceiving(selectable.filter((i) => selected.has(i.id)))
  const finish = () => {
    setReceiving(null)
    setSelected(new Set())
  }

  const fixConversion = (item: PurchaseOrderItem) =>
    router.push(`/inventory/discrete-conversion?itemId=${item.item.id}&supplierId=${item.purchaseOrders.supplierId}&purchasedUomId=${item.uomId}`)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle>Expected</SectionTitle>
        {selectable.length > 1 && (
          <button type="button" className="btn btn-ghost" onClick={() => setSelected(allSelected ? new Set() : new Set(selectable.map((i) => i.id)))}>
            {allSelected ? "Clear selection" : "Select all"}
          </button>
        )}
      </div>

      {receivable.length === 0 ? (
        <p className="text-base-content/60">Nothing left to receive on this order.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {receivable.map((item) => {
            const isSelected = selected.has(item.id)
            const name = item.alias?.alias?.name ?? item.item.name
            return (
              <li key={item.id}>
                {item.hasConversionError ? (
                  <div className="flex h-full flex-col gap-3 rounded-box border-2 border-error/40 p-4">
                    <div className="flex justify-between gap-2 text-lg">
                      <span className="font-semibold">{name}</span>
                      <span>{toFracitonalDigits.weight(item.quantity)} {item.uom.abbreviation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-error">
                      <TbAlertTriangle className="size-5" /> No conversion from {item.uom.abbreviation} to {item.item.inventoryUom.abbreviation}
                    </div>
                    <button type="button" className="btn btn-error btn-outline self-start" onClick={() => fixConversion(item)}>Set up conversion</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggle(item.id)}
                    className={`flex h-full w-full items-center gap-4 rounded-box border-2 p-4 text-left transition ${isSelected ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/30"}`}
                  >
                    <input type="checkbox" tabIndex={-1} readOnly checked={isSelected} className="checkbox checkbox-lg checkbox-primary pointer-events-none" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-lg font-semibold">{name}</span>
                      {name !== item.item.name && <span className="truncate text-sm text-base-content/60">{item.item.name}</span>}
                      {item.purchaseOrderStatusId === purchaseOrderStatuses.partiallyReceived && (
                        <span className="text-sm text-info">Rest of an earlier delivery</span>
                      )}
                    </span>
                    <span className="shrink-0 text-lg">{toFracitonalDigits.weight(item.quantity)} {item.uom.abbreviation}</span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {receivable.length > 0 && (
        <button type="button" className="btn btn-lg btn-primary self-start" disabled={selected.size === 0} onClick={start}>
          <TbTruckDelivery className="size-6" />
          {selected.size === 0 ? "Select what arrived" : `Receive ${selected.size === 1 ? "1 item" : `${selected.size} items`}`}
        </button>
      )}

      {receiving && (
        <ReceiveFlow
          purchaseOrder={purchaseOrder}
          items={receiving}
          allItems={items}
          expectations={expectations}
          fileTypes={fileTypes}
          onClose={finish}
        />
      )}
    </div>
  )
}

export default ReceivePanel
