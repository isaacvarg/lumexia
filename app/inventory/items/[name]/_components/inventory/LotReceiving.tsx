'use client'
import { useEffect, useState } from "react"
import Link from "next/link"
import { DateTime } from "luxon"
import { TbExternalLink, TbPencil, TbPhoto } from "react-icons/tb"
import Card from "@/components/Card"
import LabelDataPair from "@/components/Text/LabelDataPair"
import ReceivingFlags from "@/components/Receiving/ReceivingFlags"
import { formatDate, fromDateInput, toDateInput } from "@/components/ItemDocuments/presentation"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"
import { useItemActions, useItemSelection } from "@/store/itemSlice"
import type { LotReceipt } from "@/lib/receiving/lots"
import { getLotReceipt, updateLotSupplierDetails } from "../../_actions/inventory/lotReceiving"

// Supplier lot, dates and how the lot came in at the dock. Editable, since what was captured at receiving
// can be wrong or (for older lots) missing.
const LotReceiving = () => {
  const { selectedLot } = useItemSelection()
  const { setSelectedLot } = useItemActions()
  const [receipt, setReceipt] = useState<LotReceipt | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ supplierLotNumber: "", expiresAt: "", manufacturedAt: "" })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const lotId = selectedLot?.id
  useEffect(() => {
    if (!lotId) return
    setReceipt(null)
    getLotReceipt(lotId).then(setReceipt).catch(() => setReceipt(null))
  }, [lotId])

  if (!selectedLot) return null
  const received = selectedLot.lotOrigin?.originType === "purchaseOrderReceiving"

  const startEditing = () => {
    setForm({
      supplierLotNumber: selectedLot.supplierLotNumber ?? "",
      expiresAt: toDateInput(selectedLot.expiresAt),
      manufacturedAt: toDateInput(selectedLot.manufacturedAt),
    })
    setMessage(null)
    setEditing(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const details = {
        supplierLotNumber: form.supplierLotNumber.trim() || null,
        expiresAt: fromDateInput(form.expiresAt),
        manufacturedAt: fromDateInput(form.manufacturedAt),
      }
      const { linked } = await updateLotSupplierDetails(selectedLot.id, details)
      setSelectedLot({ ...selectedLot, ...details })
      setMessage(linked > 0 ? `Attached ${linked} document${linked === 1 ? "" : "s"} that were waiting for this supplier lot.` : null)
      setEditing(false)
      // no router.refresh(): the item page resets the open lot when it reloads
      getLotReceipt(selectedLot.id).then(setReceipt).catch(() => {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card.Root>
      <div className="flex items-center justify-between">
        <Card.Title>{received ? "Receiving" : "Supplier details"}</Card.Title>
        {!editing && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={startEditing}>
            <TbPencil className="size-4" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Supplier lot number</span>
            <input
              className="input w-full font-mono"
              value={form.supplierLotNumber}
              onChange={(e) => setForm({ ...form, supplierLotNumber: e.target.value.toUpperCase() })}
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Expiry or retest</span>
              <input type="date" className="input w-full" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Manufactured</span>
              <input type="date" className="input w-full" value={form.manufacturedAt} onChange={(e) => setForm({ ...form, manufacturedAt: e.target.value })} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
              {saving && <span className="loading loading-spinner loading-xs" />} Save
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-1">
          <LabelDataPair label="Supplier lot" data={selectedLot.supplierLotNumber ?? "Not recorded"} />
          <LabelDataPair label="Expires" data={formatDate(selectedLot.expiresAt) ?? "—"} />
          <LabelDataPair label="Manufactured" data={formatDate(selectedLot.manufacturedAt) ?? "—"} />
          {receipt && (
            <>
              <LabelDataPair
                label="Received"
                data={`${DateTime.fromJSDate(new Date(receipt.receivedAt)).toFormat(dateFormatWithTime)} by ${receipt.receivedBy}`}
              />
              {receipt.packingSlipNumber && <LabelDataPair label="Packing slip" data={receipt.packingSlipNumber} />}
              <LabelDataPair
                label="Inspection"
                data={receipt.failedChecks.length === 0 ? "All OK" : `Failed: ${receipt.failedChecks.join(", ")}`}
              />
            </>
          )}
        </div>
      )}

      {message && <div className="alert alert-success alert-soft text-sm">{message}</div>}

      {receipt && !editing && (
        <div className="flex flex-col gap-2">
          {receipt.issueNote && <p className="rounded-lg bg-error/5 p-2 text-sm">{receipt.issueNote}</p>}
          <ReceivingFlags flags={receipt.flags} />
          {receipt.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {receipt.photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost border-base-300">
                  <TbPhoto className="size-3.5" /> <span className="max-w-32 truncate">{p.name}</span>
                </a>
              ))}
            </div>
          )}
          <Link
            href={`/receiving/${receipt.purchaseOrder.referenceCode}?id=${receipt.purchaseOrder.id}`}
            className="link link-hover flex items-center gap-1 text-sm"
          >
            PO #{receipt.purchaseOrder.referenceCode} receiving <TbExternalLink className="size-3.5" />
          </Link>
        </div>
      )}
    </Card.Root>
  )
}

export default LotReceiving
