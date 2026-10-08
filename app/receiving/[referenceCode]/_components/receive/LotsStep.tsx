'use client'
import { TbCircleCheck, TbPlus, TbTrash } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import type { ItemExpectations, ReceivingFileType } from "@/lib/receiving/queries"
import { sameSupplierLot } from "@/lib/itemDocuments/supplierLots"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { LineDraft, linePlan, LotDraft, newLot, round } from "./draft"

type Props = {
  item: PurchaseOrderItem
  line: LineDraft
  expectations: ItemExpectations | undefined
  fileTypes: ReceivingFileType[]
  onChange: (line: LineDraft) => void
}

const LotsStep = ({ item, line, expectations, fileTypes, onChange }: Props) => {
  const uom = item.uom.abbreviation
  const plan = linePlan(item, line)
  const typeName = (id: string) => fileTypes.find((t) => t.id === id)?.abbreviaton || fileTypes.find((t) => t.id === id)?.name || "Document"

  const setLot = (key: string, patch: Partial<LotDraft>) =>
    onChange({ ...line, lots: line.lots.map((l) => (l.key === key ? { ...l, ...patch } : l)) })

  const addLot = () => onChange({ ...line, lots: [...line.lots, newLot(plan.remainder)] })

  // documents uploaded for a removed lot move to the first remaining one rather than disappearing
  const removeLot = (key: string) => {
    const lots = line.lots.filter((l) => l.key !== key)
    onChange({ ...line, lots, documents: line.documents.map((d) => (d.lotKey === key ? { ...d, lotKey: lots[0]?.key ?? null } : d)) })
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-base-content/70">
        One row per supplier lot in the delivery. Each one becomes its own lot here with its own label.
      </p>

      {line.lots.map((lot, index) => {
        const onFile = lot.supplierLotNumber.trim()
          ? (expectations?.waitingDocuments ?? []).filter((d) => sameSupplierLot(d.supplierLotNumber, lot.supplierLotNumber))
          : []
        return (
          <div key={lot.key} className="flex flex-col gap-4 rounded-box border border-base-300 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Lot {index + 1}</span>
              {line.lots.length > 1 && (
                <button type="button" className="btn btn-ghost text-error" onClick={() => removeLot(lot.key)}>
                  <TbTrash className="size-5" /> Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-medium">Supplier lot number</span>
                <input
                  className="input input-lg w-full font-mono"
                  value={lot.supplierLotNumber}
                  onChange={(e) => setLot(lot.key, { supplierLotNumber: e.target.value.toUpperCase() })}
                  placeholder="As printed on the container"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {onFile.length > 0 ? (
                  <span className="flex items-center gap-1 text-sm text-success">
                    <TbCircleCheck className="size-4" />
                    {onFile.map((d) => typeName(d.fileTypeId)).join(", ")} already on file for this lot
                  </span>
                ) : (
                  !lot.supplierLotNumber.trim() && <span className="text-sm text-base-content/50">Leave blank only if there&apos;s none on the container</span>
                )}
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Quantity ({uom})</span>
                <label className="input input-lg w-full">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={lot.quantity}
                    onChange={(e) => setLot(lot.key, { quantity: e.target.value })}
                    className="grow"
                  />
                  <span className="text-base-content/50">{uom}</span>
                </label>
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Expiry or retest date <span className="font-normal text-base-content/50">(optional)</span></span>
                <input type="date" className="input input-lg w-full" value={lot.expiresAt} onChange={(e) => setLot(lot.key, { expiresAt: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium">Manufacture date <span className="font-normal text-base-content/50">(optional)</span></span>
                <input type="date" className="input input-lg w-full" value={lot.manufacturedAt} onChange={(e) => setLot(lot.key, { manufacturedAt: e.target.value })} />
              </label>
            </div>
          </div>
        )
      })}

      <button type="button" className="btn btn-lg btn-outline self-start" onClick={addLot}>
        <TbPlus className="size-6" /> Add another supplier lot
      </button>

      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-box p-4 text-lg ${plan.overReceived ? "bg-warning/15" : plan.remainder > 0 ? "bg-info/10" : "bg-success/10"}`}
      >
        <span>
          Total <span className="font-semibold">{toFracitonalDigits.weight(round(plan.received))} {uom}</span> of {toFracitonalDigits.weight(item.quantity)} {uom} expected
        </span>
        <span className="text-base">
          {plan.overReceived
            ? "More than ordered. It'll be flagged."
            : plan.remainder > 0
              ? `${toFracitonalDigits.weight(round(plan.remainder))} ${uom} stays open on the PO`
              : "Matches the order"}
        </span>
      </div>
    </div>
  )
}

export default LotsStep
