'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TbLink, TbSearch } from "react-icons/tb"
import Dialog from "@/components/Dialog"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { addSurrogateDocument, findSurrogateCandidates, SurrogateCandidate } from "../../_actions/files/surrogates"
import { formatDate } from "@/components/ItemDocuments/presentation"

export const surrogateDialogId = "itemSurrogateDialog"

// Picks another item's current document to stand in for this item's own, with the reason why.
const SurrogateDialog = ({ fileTypeId }: { fileTypeId: string | null }) => (
  <Dialog.Root identifier={surrogateDialogId} contentClassName="max-h-[92vh] w-[95vw] max-w-2xl">
    {fileTypeId && <SurrogateDialogContent key={fileTypeId} fileTypeId={fileTypeId} />}
  </Dialog.Root>
)

const SurrogateDialogContent = ({ fileTypeId }: { fileTypeId: string }) => {
  const router = useRouter()
  const { resetDialogContext } = useDialog()
  const { item, documents } = useItemSelection()
  const fileType = documents.fileTypes.find((t) => t.id === fileTypeId)
  const [query, setQuery] = useState("")
  const [candidates, setCandidates] = useState<SurrogateCandidate[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!item) return
    let cancelled = false
    const timer = setTimeout(() => {
      findSurrogateCandidates(item.id, fileTypeId, query)
        .then((found) => !cancelled && setCandidates(found))
        .catch(() => !cancelled && setCandidates([]))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [item, fileTypeId, query])

  const save = async () => {
    if (!item || !selected) return
    if (!reason.trim()) {
      setError("Say why this document can stand in.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const result = await addSurrogateDocument(item.id, selected, reason)
      if ("error" in result) {
        setError(result.error ?? "Couldn't save.")
        return
      }
      resetDialogContext()
      router.refresh()
    } catch {
      setError("Couldn't save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Use another item&apos;s {fileType?.name ?? "document"}</h2>
        <p className="text-sm text-base-content/60">
          Until this item has its own, another item&apos;s current document can stand in. It counts as a surrogate and is
          flagged when that document is replaced. Uploading this item&apos;s own document replaces it.
        </p>
      </div>

      <label className="input input-sm w-full">
        <TbSearch className="opacity-50" />
        <input type="search" placeholder="Search items by name, code or alias" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
      </label>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-base-300">
        {candidates === null ? (
          <p className="p-4 text-sm text-base-content/60"><span className="loading loading-spinner loading-xs" /> Searching…</p>
        ) : candidates.length === 0 ? (
          <p className="p-4 text-sm text-base-content/60">No other item has a current {fileType?.name ?? "document"}{query ? " matching that" : ""}.</p>
        ) : (
          <ul className="divide-y divide-base-300">
            {candidates.map((c) => (
              <li key={c.id}>
                <label className={`flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-base-200 ${selected === c.id ? "bg-base-200" : ""}`}>
                  <input type="radio" name="surrogate" className="radio radio-sm mt-1" checked={selected === c.id} onChange={() => setSelected(c.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{c.item.name} <span className="font-normal text-base-content/50">{c.item.referenceCode}</span></span>
                    <span className="block truncate text-sm text-base-content/70">
                      {c.file.name}
                      {c.supplier && <span className="text-base-content/50"> · {c.supplier.name}</span>}
                      {c.issuedAt && <span className="text-base-content/50"> · issued {formatDate(c.issuedAt)}</span>}
                      {c.revision && <span className="text-base-content/50"> · rev {c.revision}</span>}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Why it can stand in</span>
        <textarea
          className="textarea textarea-sm w-full"
          rows={2}
          placeholder="e.g. Same material (CAS 56-81-5) from another supplier; own SDS requested 10/20"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <div className="flex justify-end gap-2 border-t border-base-300 pt-4">
        <button type="button" onClick={resetDialogContext} className="btn btn-ghost">Cancel</button>
        <button type="button" onClick={save} disabled={saving || !selected} className="btn btn-primary">
          {saving ? <span className="loading loading-spinner loading-xs" /> : <TbLink />}
          Use as surrogate
        </button>
      </div>
    </div>
  )
}

export default SurrogateDialog
