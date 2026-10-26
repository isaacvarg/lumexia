'use client'
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { TbChevronDown, TbChevronRight, TbListSearch } from "react-icons/tb"
import { useItemSelection } from "@/store/itemSlice"
import { getItemFactsView } from "@/actions/documentExtractions"
import type { ItemFact } from "@/lib/documentExtractions/queries"
import ItemFactList, { differingKeys } from "@/components/DocumentExtractions/ItemFactList"
import { useFilesActions } from "./FilesContext"

// What the item's current documents say, all in one place: the facts the extraction agent read from each
// file, grouped by kind of fact. Evidence, not Canon; each fact links back to its document.
const ItemFactsPanel = () => {
  const { item, documents, files } = useItemSelection()
  const { preview } = useFilesActions()
  const [facts, setFacts] = useState<ItemFact[] | null>(null)
  const [open, setOpen] = useState(false)

  // reload when the documents' extraction state changes (a new reading, a check, a correction)
  const extractionKey = JSON.stringify(documents.extractions)
  useEffect(() => {
    if (!item) return
    let cancelled = false
    getItemFactsView(item.id)
      .then((f) => !cancelled && setFacts(f))
      .catch(() => !cancelled && setFacts([]))
    return () => {
      cancelled = true
    }
  }, [item, extractionKey])

  const differing = useMemo(() => (facts ? differingKeys(facts).size : 0), [facts])
  const kinds = useMemo(() => new Set(facts?.map((f) => f.key)).size, [facts])
  const toCheck = facts?.filter((f) => f.needsHumanCheck && !f.verified).length ?? 0

  if (!item || !facts || facts.length === 0) return null

  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="flex flex-wrap items-center gap-3 border-b border-base-300 bg-base-200/60 px-4 py-2">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex flex-1 items-center gap-2 text-left font-semibold" aria-expanded={open}>
          {open ? <TbChevronDown /> : <TbChevronRight />}
          Extracted facts
          <span className="text-sm font-normal text-base-content/60">
            {facts.length} fact{facts.length === 1 ? "" : "s"} of {kinds} kind{kinds === 1 ? "" : "s"}
          </span>
          {toCheck > 0 && <span className="badge badge-warning badge-soft badge-sm">{toCheck} to check</span>}
          {differing > 0 && <span className="badge badge-warning badge-soft badge-sm">{differing} where documents differ</span>}
        </button>
        <Link href={`/quality/documents/facts?item=${encodeURIComponent(item.referenceCode)}`} className="btn btn-ghost btn-xs">
          <TbListSearch /> Search
        </Link>
      </div>
      {open && (
        <div className="flex flex-col gap-2 p-4">
          <p className="text-xs text-base-content/60">
            What this item&apos;s current documents say, as read by the extraction agent. Unverified facts are evidence, not
            approved values; open a document to verify or correct them.
          </p>
          <ItemFactList
            facts={facts}
            onOpenDocument={(documentId) => {
              const file = files.find((f) => f.id === documentId)
              if (file) preview(file)
            }}
          />
        </div>
      )}
    </section>
  )
}

export default ItemFactsPanel
