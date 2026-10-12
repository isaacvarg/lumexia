'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TbArrowLeft, TbCircleCheck, TbSearch } from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import { InboxSuggestion } from "@/lib/documentInbox/types"
import { suggestSupplierId } from "@/lib/itemDocuments/suppliers"
import { issuerLabel, needsAttention, StatusBadge } from "@/components/ItemDocuments/presentation"
import DocumentForm, {
  DocumentFormSource,
  DocumentFormSourceProvider,
  DocumentFormValue,
  emptyDocumentForm,
  fromDocumentForm,
  useDocumentExpectations,
  useDocumentFormSource,
  validateDocumentForm,
} from "@/app/inventory/items/[name]/_components/files/DocumentForm"
import ReplaceChoices, { useReplaceChoices } from "@/app/inventory/items/[name]/_components/files/ReplaceChoices"
import { fileToItem, FilingItem, getItemFilingContext, searchItemsForFiling } from "../_actions"
import type { InboxRow } from "../_rows"
import type { InboxOptions } from "./Inbox"

export const fileToItemDialogId = "inboxFileToItem"

type ChosenItem = Pick<FilingItem, "id" | "name" | "referenceCode">

const useDebounced = <T,>(value: T, ms: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

const ItemPicker = ({ onPick }: { onPick: (item: ChosenItem) => void }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<FilingItem[]>([])
  const [searching, setSearching] = useState(false)
  const debounced = useDebounced(query, 250)

  useEffect(() => {
    let current = true
    if (debounced.trim().length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    searchItemsForFiling(debounced)
      .then((r) => current && setResults(r))
      .finally(() => current && setSearching(false))
    return () => { current = false }
  }, [debounced])

  return (
    <div className="flex flex-col gap-3">
      <label className="input input-bordered flex w-full items-center gap-2">
        <TbSearch className="size-4 text-base-content/50" />
        <input
          autoFocus
          className="grow"
          placeholder="Item name, reference code or alias"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && <span className="loading loading-spinner loading-xs" />}
      </label>
      <ul className="flex max-h-80 flex-col overflow-y-auto">
        {results.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onPick(item)} className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-base-200">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-base-content/60">
                {item.referenceCode} · {item.itemType.name}
                {item.aliases.length > 0 && ` · also ${item.aliases.map((a) => a.name).join(", ")}`}
              </span>
            </button>
          </li>
        ))}
        {debounced.trim().length >= 2 && !searching && results.length === 0 && (
          <li className="px-3 py-2 text-sm text-base-content/60">No items match.</li>
        )}
      </ul>
    </div>
  )
}

// Which of the item's requirements this filing would count toward, and how they stand now.
const RequirementHints = ({ value }: { value: DocumentFormValue }) => {
  const { documents } = useDocumentFormSource()
  if (documents.requirements.length === 0) {
    return <p className="text-sm text-base-content/60">No document requirements apply to this item.</p>
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">This item&apos;s requirements</span>
      <ul className="flex flex-wrap gap-2">
        {documents.requirements.map((r) => {
          const type = documents.fileTypes.find((t) => t.id === r.requirement.fileTypeId)
          const counts = r.requirement.fileTypeId === value.fileTypeId && (r.requirement.issuer === "any" || r.requirement.issuer === value.issuer)
          return (
            <li
              key={r.requirement.id}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-sm ${counts ? "border-primary bg-primary/5" : "border-base-300"}`}
            >
              {counts && <TbCircleCheck className="size-4 text-primary" aria-label="This filing counts toward it" />}
              <span className="font-medium">{type?.name}</span>
              <span className="text-xs text-base-content/50">{issuerLabel(r.requirement.issuer)}{r.requirement.scope === "lot" ? " · per lot" : ""}</span>
              {(r.requirement.level === "required" || needsAttention(r.status)) && <StatusBadge status={r.status} size="xs" />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const initialValue = (suggestion: InboxSuggestion | null, messageSupplierId: string | null, source: DocumentFormSource): DocumentFormValue => {
  const value: DocumentFormValue = {
    ...emptyDocumentForm,
    fileTypeId: suggestion?.fileType?.id ?? "",
    issuer: suggestion?.issuer ?? "supplier",
    supplierId: suggestion?.supplier?.id ?? messageSupplierId ?? "",
    supplierLotNumber: suggestion?.supplierLot ?? "",
    issuedAt: suggestion?.issuedAt ?? "",
    expiresAt: suggestion?.expiresAt ?? "",
    revision: suggestion?.revision ?? "",
  }
  if (value.issuer === "supplier" && !value.supplierId) value.supplierId = suggestSupplierId(source.documents.orderedFrom)
  return value
}

const FilingForm = ({ document, item, onBack }: { document: InboxRow; item: ChosenItem; onBack: () => void }) => {
  const router = useRouter()
  const { resetDialogContext } = useDialog()
  const source = useDocumentFormSource()
  const [value, setValue] = useState(() => initialValue(document.suggestion, document.message.supplier?.id ?? null, source))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const expectations = useDocumentExpectations(value)
  const replaceChoices = useReplaceChoices(value, source.files, true)
  const purchaseOrder = document.suggestion?.purchaseOrder ?? null

  const save = async () => {
    const problem = validateDocumentForm(value, expectations)
    if (problem) return setError(problem)
    setSaving(true)
    setError(null)
    try {
      const result = await fileToItem(document.id, item.id, fromDocumentForm(value, purchaseOrder?.id ?? null), replaceChoices.alsoReplaceIds)
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
      <div className="flex items-center gap-3 rounded-lg bg-base-200 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{item.name}</div>
          <div className="text-xs text-base-content/60">{item.referenceCode}</div>
        </div>
        <button type="button" onClick={onBack} className="btn btn-ghost btn-sm"><TbArrowLeft /> Change item</button>
      </div>

      <RequirementHints value={value} />
      <DocumentForm value={value} onChange={setValue} />
      {purchaseOrder && <p className="text-sm text-base-content/60">Linked to PO #{purchaseOrder.referenceCode}, as the agent suggested.</p>}
      <ReplaceChoices choices={replaceChoices} />

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <div className="flex justify-end gap-2 border-t border-base-300 pt-4">
        <button type="button" onClick={resetDialogContext} className="btn btn-ghost">Cancel</button>
        <button type="button" onClick={save} disabled={saving} className="btn btn-primary">
          {saving && <span className="loading loading-spinner loading-xs" />}
          File on {item.name}
        </button>
      </div>
    </div>
  )
}

const FileToItemDialogContent = ({ document, options }: { document: InboxRow; options: InboxOptions }) => {
  const suggested = document.suggestion?.item ?? null
  const [item, setItem] = useState<ChosenItem | null>(suggested)
  const [context, setContext] = useState<Pick<DocumentFormSource, "documents" | "files"> | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let current = true
    setContext(null)
    setLoadError(false)
    if (item) {
      getItemFilingContext(item.id)
        .then((c) => current && setContext(c))
        .catch(() => current && setLoadError(true))
    }
    return () => { current = false }
  }, [item])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold">File on an item</h2>
        <p className="truncate text-sm text-base-content/60">{document.fileName}</p>
      </div>

      {!item ? (
        <ItemPicker onPick={setItem} />
      ) : loadError ? (
        <div role="alert" className="alert alert-error alert-soft text-sm">Couldn&apos;t load this item&apos;s documents.</div>
      ) : !context ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner" /></div>
      ) : (
        <DocumentFormSourceProvider value={{ fileTypes: options.fileTypes, suppliers: options.suppliers, ...context }}>
          <FilingForm key={item.id} document={document} item={item} onBack={() => setItem(null)} />
        </DocumentFormSourceProvider>
      )}
    </div>
  )
}

export default FileToItemDialogContent
