'use client'
import { TbPencil } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import type { ItemExpectations, ReceivingFileType } from "@/lib/receiving/queries"
import { failedChecks } from "@/lib/receiving/checks"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { FlagBadge } from "@/components/Receiving/ReceivingFlags"
import { formatDate, fromDateInput } from "@/components/ItemDocuments/presentation"
import { DeliveryDraft, draftFlags, LineDraft, linkedDocuments, parseQuantity } from "./draft"

type Props = {
  delivery: DeliveryDraft
  items: PurchaseOrderItem[]
  lines: LineDraft[]
  expectationsFor: (item: PurchaseOrderItem) => ItemExpectations | undefined
  fileTypes: ReceivingFileType[]
  onEdit: (lineIndex: number, step: "inspect" | "lots" | "documents") => void
}

const ReviewStep = ({ delivery, items, lines, expectationsFor, fileTypes, onEdit }: Props) => {
  const typeName = (id: string) => fileTypes.find((t) => t.id === id)?.abbreviaton || fileTypes.find((t) => t.id === id)?.name || "Document"

  return (
    <div className="flex flex-col gap-5">
      <p className="text-base-content/70">
        Check everything once more. Warnings don&apos;t stop the receipt; they show on the lots until they&apos;re sorted out.
      </p>

      {(delivery.packingSlipNumber || delivery.carrier || delivery.packingSlips.length > 0) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-base-content/70">
          {delivery.packingSlipNumber && <span>Packing slip {delivery.packingSlipNumber}</span>}
          {delivery.carrier && <span>Carrier: {delivery.carrier}</span>}
          {delivery.packingSlips.length > 0 && <span>{delivery.packingSlips.length} packing slip file(s)</span>}
        </div>
      )}

      {lines.map((line, lineIndex) => {
        const item = items.find((i) => i.id === line.purchaseOrderItemId)!
        const expectations = expectationsFor(item)
        const flags = draftFlags(item, line, expectations)
        const failed = failedChecks(line.checks)
        const uom = item.uom.abbreviation
        return (
          <section key={line.purchaseOrderItemId} className="flex flex-col gap-4 rounded-box border border-base-300 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-xl font-semibold">{item.alias?.alias?.name ?? item.item.name}</h3>
              <div className="flex flex-wrap gap-1">
                {flags.filter((f) => !f.lotKey).map((f) => <FlagBadge key={f.flag} flag={f.flag} size="md" />)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                Inspection:{" "}
                {failed.length === 0 ? <span className="text-success">all OK</span> : <span className="text-error">{failed.map((c) => c.label).join(", ")}</span>}
                {line.photos.length > 0 && <span className="text-base-content/60"> · {line.photos.length} photo(s)</span>}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => onEdit(lineIndex, "inspect")}><TbPencil className="size-5" /> Edit</button>
            </div>
            {line.issueNote.trim() && <p className="rounded-lg bg-error/5 p-3 text-base-content/80">{line.issueNote}</p>}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Lots</span>
                <button type="button" className="btn btn-ghost" onClick={() => onEdit(lineIndex, "lots")}><TbPencil className="size-5" /> Edit</button>
              </div>
              <ul className="flex flex-col divide-y divide-base-300 rounded-lg bg-base-200/50">
                {line.lots.map((lot) => {
                  const lotFlags = flags.filter((f) => f.lotKey === lot.key)
                  const docs = [
                    ...linkedDocuments(lot, expectations?.waitingDocuments ?? []).map((d) => typeName(d.fileTypeId)),
                    ...line.documents.filter((d) => d.lotKey === lot.key && d.fileTypeId).map((d) => typeName(d.fileTypeId)),
                  ]
                  return (
                    <li key={lot.key} className="flex flex-col gap-1 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-lg">{lot.supplierLotNumber.trim().toUpperCase() || "No supplier lot"}</span>
                        <span className="text-lg font-semibold">{toFracitonalDigits.weight(parseQuantity(lot.quantity))} {uom}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
                        {lot.expiresAt && <span>Expires {formatDate(fromDateInput(lot.expiresAt))}</span>}
                        {lot.manufacturedAt && <span>Made {formatDate(fromDateInput(lot.manufacturedAt))}</span>}
                        {docs.length > 0 && <span>Documents: {docs.join(", ")}</span>}
                      </div>
                      {lotFlags.length > 0 && <div className="flex flex-wrap gap-1">{lotFlags.map((f) => <FlagBadge key={f.flag} flag={f.flag} />)}</div>}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base-content/70">
                {line.documents.filter((d) => d.lotKey === null && d.fileTypeId).length > 0
                  ? `Item documents: ${line.documents.filter((d) => d.lotKey === null && d.fileTypeId).map((d) => typeName(d.fileTypeId)).join(", ")}`
                  : "No item documents added"}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => onEdit(lineIndex, "documents")}><TbPencil className="size-5" /> Edit</button>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ReviewStep
