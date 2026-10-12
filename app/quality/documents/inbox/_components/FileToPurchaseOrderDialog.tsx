'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TbSearch } from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import { formatDate } from "@/components/ItemDocuments/presentation"
import { fileToPurchaseOrder, FilingPurchaseOrder, searchPurchaseOrdersForFiling } from "../_actions"
import type { InboxRow } from "../_rows"
import type { InboxOptions } from "./Inbox"

export const fileToPurchaseOrderDialogId = "inboxFileToPurchaseOrder"

// Invoices, packing slips and order confirmations go on the PO's accounting files.
const FileToPurchaseOrderDialogContent = ({ document, options }: { document: InboxRow; options: InboxOptions }) => {
  const router = useRouter()
  const { resetDialogContext } = useDialog()
  const suggested = document.suggestion?.purchaseOrder
  const supplierId = document.message.supplier?.id ?? null
  const [query, setQuery] = useState(suggested ? String(suggested.referenceCode) : "")
  const [results, setResults] = useState<FilingPurchaseOrder[]>([])
  const [chosen, setChosen] = useState<string | null>(null)
  const [fileTypeId, setFileTypeId] = useState(
    (options.accountingFileTypes.find((t) => t.name.toLowerCase() === "general") ?? options.accountingFileTypes[0])?.id ?? ""
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let current = true
    const t = setTimeout(() => {
      searchPurchaseOrdersForFiling(query, supplierId).then((r) => {
        if (!current) return
        setResults(r)
        if (r.length === 1) setChosen(r[0].id)
      })
    }, 250)
    return () => { current = false; clearTimeout(t) }
  }, [query, supplierId])

  const save = async () => {
    if (!chosen) return setError("Choose a purchase order.")
    setSaving(true)
    setError(null)
    try {
      const result = await fileToPurchaseOrder(document.id, chosen, fileTypeId)
      if (result.error) return setError(result.error)
      resetDialogContext()
      router.refresh()
    } catch {
      setError("Couldn't file it. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold">File on a purchase order</h2>
        <p className="truncate text-sm text-base-content/60">{document.fileName}</p>
      </div>

      <label className="input input-bordered flex w-full items-center gap-2">
        <TbSearch className="size-4 text-base-content/50" />
        <input
          autoFocus
          className="grow"
          placeholder="PO number or supplier name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {!query && document.message.supplier && (
        <p className="-mt-3 text-xs text-base-content/60">Recent orders from {document.message.supplier.name}, who sent this.</p>
      )}

      <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto" role="radiogroup" aria-label="Purchase order">
        {results.map((po) => (
          <li key={po.id}>
            <button
              type="button"
              role="radio"
              aria-checked={chosen === po.id}
              onClick={() => setChosen(po.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left ${chosen === po.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-base-200"}`}
            >
              <span>
                <span className="font-medium">PO #{po.referenceCode}</span>
                <span className="text-sm text-base-content/60"> · {po.supplier.name}</span>
              </span>
              <span className="text-xs text-base-content/60">{po.status.name} · {formatDate(po.createdAt)}</span>
            </button>
          </li>
        ))}
        {results.length === 0 && (query || supplierId) && <li className="px-3 py-2 text-sm text-base-content/60">No purchase orders match.</li>}
      </ul>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">File type</span>
        <select className="select select-sm w-full max-w-xs" value={fileTypeId} onChange={(e) => setFileTypeId(e.target.value)}>
          {options.accountingFileTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <div className="flex justify-end gap-2 border-t border-base-300 pt-4">
        <button type="button" onClick={resetDialogContext} className="btn btn-ghost">Cancel</button>
        <button type="button" onClick={save} disabled={saving || !chosen} className="btn btn-primary">
          {saving && <span className="loading loading-spinner loading-xs" />}
          File on purchase order
        </button>
      </div>
    </div>
  )
}

export default FileToPurchaseOrderDialogContent
