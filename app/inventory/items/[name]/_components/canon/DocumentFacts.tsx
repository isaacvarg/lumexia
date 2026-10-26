'use client'
import { createContext, useContext, useMemo, useState } from "react"
import { TbChevronDown, TbChevronRight, TbFileText } from "react-icons/tb"
import type { CanonEntry, ItemCanon } from "@/lib/canon/queries"
import type { ItemFact } from "@/lib/documentExtractions/queries"
import ItemFactList from "@/components/DocumentExtractions/ItemFactList"

// Facts the item's documents state for each data type that's mapped to fact keys (Settings → Canon), shown
// beside the value as evidence. A supplier statement only sees that supplier's documents.

export const DocumentFactsContext = createContext<ItemCanon["documentFacts"]>({})

export const useDocumentFacts = (entry: CanonEntry): ItemFact[] => {
  const all = useContext(DocumentFactsContext)
  return useMemo(() => {
    const facts = all[entry.dataType.id] ?? []
    const subject = entry.subject
    if (subject.kind !== "itemSupplier") return facts
    return facts
      .map((f) => ({ ...f, documents: f.documents.filter((d) => d.supplier?.id === subject.supplierId) }))
      .filter((f) => f.documents.length > 0)
  }, [all, entry])
}

const DocumentFacts = ({ entry }: { entry: CanonEntry }) => {
  const facts = useDocumentFacts(entry)
  const [open, setOpen] = useState(false)
  const approvedAt = entry.artifact?.currentVersion?.createdAt ?? null
  const newCount = approvedAt ? facts.filter((f) => new Date(f.extraction.readAt) > new Date(approvedAt)).length : 0

  if (facts.length === 0) return null
  return (
    <div className="flex flex-col gap-2 border-t border-base-300 pt-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-left text-sm font-medium" aria-expanded={open}>
        {open ? <TbChevronDown /> : <TbChevronRight />}
        <TbFileText className="size-4 text-base-content/60" />
        What the documents say
        <span className="badge badge-ghost badge-sm">{facts.length}</span>
        {newCount > 0 && <span className="badge badge-info badge-soft badge-sm" title="Read after the current value was approved">{newCount} new since approved</span>}
      </button>
      {open && (
        <>
          <p className="text-xs text-base-content/60">Read from the item&apos;s documents by the extraction agent; evidence to compare with the value, not approved data.</p>
          <ItemFactList facts={facts} newSince={approvedAt} />
        </>
      )}
    </div>
  )
}

export default DocumentFacts
