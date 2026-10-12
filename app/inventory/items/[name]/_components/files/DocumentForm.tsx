'use client'
import { createContext, useContext, useState } from "react"
import { useItemSelection } from "@/store/itemSlice"
import { ItemDocumentDetails } from "../../_actions/files/itemDocumentMutations"
import { ItemDocuments } from "../../_actions/files/getItemDocuments"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { formatDate, fromDateInput, toDateInput } from "@/components/ItemDocuments/presentation"
import { sameSupplierLot } from "@/lib/itemDocuments/supplierLots"

export type DocumentFormValue = {
  fileTypeId: string
  issuer: "supplier" | "internal"
  supplierId: string
  lotId: string
  supplierLotNumber: string
  issuedAt: string
  expiresAt: string
  revision: string
  derivedFromId: string
}

export const emptyDocumentForm: DocumentFormValue = {
  fileTypeId: "",
  issuer: "supplier",
  supplierId: "",
  lotId: "",
  supplierLotNumber: "",
  issuedAt: "",
  expiresAt: "",
  revision: "",
  derivedFromId: "",
}

type StoredDocument = {
  fileTypeId: string
  issuer: string
  supplierId: string | null
  lotId: string | null
  supplierLotNumber?: string | null
  purchaseOrderId?: string | null
  issuedAt: Date | string | null
  expiresAt: Date | string | null
  revision: string | null
  derivedFromId: string | null
}

export const toDocumentForm = (d: StoredDocument): DocumentFormValue => ({
  fileTypeId: d.fileTypeId,
  issuer: d.issuer === "internal" ? "internal" : "supplier",
  supplierId: d.supplierId ?? "",
  lotId: d.lotId ?? "",
  supplierLotNumber: d.supplierLotNumber ?? "",
  issuedAt: toDateInput(d.issuedAt),
  expiresAt: toDateInput(d.expiresAt),
  revision: d.revision ?? "",
  derivedFromId: d.derivedFromId ?? "",
})

// purchaseOrderId isn't edited here; pass the stored one so editing keeps it
export const fromDocumentForm = (v: DocumentFormValue, purchaseOrderId: string | null = null): ItemDocumentDetails => ({
  fileTypeId: v.fileTypeId,
  issuer: v.issuer,
  supplierId: v.supplierId || null,
  lotId: v.lotId || null,
  supplierLotNumber: v.supplierLotNumber.trim() || null,
  purchaseOrderId,
  issuedAt: fromDateInput(v.issuedAt),
  expiresAt: fromDateInput(v.expiresAt),
  revision: v.revision || null,
  derivedFromId: v.issuer === "internal" ? v.derivedFromId || null : null,
})

// What the form works from: the item's requirements, lots and files plus the type and supplier lists. On the
// item page that's the item store; elsewhere (the document inbox) a provider passes the chosen item's.
export type DocumentFormSource = {
  fileTypes: { id: string; name: string; bgColor: string; textColor: string }[]
  suppliers: { id: string; name: string }[]
  documents: ItemDocuments
  files: ItemFile[]
}

const DocumentFormSourceContext = createContext<DocumentFormSource | null>(null)
export const DocumentFormSourceProvider = DocumentFormSourceContext.Provider

export const useDocumentFormSource = (): DocumentFormSource => {
  const provided = useContext(DocumentFormSourceContext)
  const { options, documents, files } = useItemSelection()
  return provided ?? { fileTypes: options.itemFileTypes, suppliers: options.suppliers, documents, files }
}

// What the item's requirements expect for the chosen file type + issuer, used to guide the form.
export const useDocumentExpectations = (v: Pick<DocumentFormValue, "fileTypeId" | "issuer">) => {
  const { documents } = useDocumentFormSource()
  const matching = documents.requirements
    .map((r) => r.requirement)
    .filter((r) => r.fileTypeId === v.fileTypeId && (r.issuer === v.issuer || r.issuer === "any"))
  return {
    perLot: matching.some((r) => r.scope === "lot"),
    needsIssueDate: matching.some((r) => r.validForMonths != null || r.minIssuedAt != null),
    notes: matching.map((r) => r.notes).filter((n): n is string => !!n),
  }
}

export const validateDocumentForm = (v: DocumentFormValue, expectations: ReturnType<typeof useDocumentExpectations>) => {
  if (!v.fileTypeId) return "Choose a document type."
  if (expectations.needsIssueDate && !v.issuedAt && !v.expiresAt) {
    return "This document expires, so add its issue date (or the expiry date printed on it)."
  }
  if (v.issuedAt && v.expiresAt && v.expiresAt <= v.issuedAt) return "The expiry date must be after the issue date."
  return null
}

const Field = ({ label, hint, className = "", children }: { label: string; hint?: React.ReactNode; className?: string; children: React.ReactNode }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-sm font-medium">{label}</span>
    {children}
    {hint && <span className="text-xs text-base-content/50">{hint}</span>}
  </label>
)

type Props = {
  value: DocumentFormValue
  onChange: (v: DocumentFormValue) => void
  // the file being edited, so it isn't offered as its own source
  editingId?: string
}

const DocumentForm = ({ value, onChange, editingId }: Props) => {
  const { fileTypes, suppliers, documents, files } = useDocumentFormSource()
  const expectations = useDocumentExpectations(value)
  const set = <K extends keyof DocumentFormValue>(key: K, v: DocumentFormValue[K]) => onChange({ ...value, [key]: v })

  // a supplier picked by hand is never overwritten; one that was prefilled is
  const [supplierPicked, setSupplierPicked] = useState(!!editingId && !!value.supplierId)

  const selectLot = (lotId: string) => {
    const lot = documents.lots.find((l) => l.id === lotId)
    // a received lot already knows its supplier and supplier lot
    const lotSupplier = value.issuer === "supplier" ? lot?.supplier?.id : undefined
    onChange({
      ...value,
      lotId,
      supplierId: !supplierPicked && lotSupplier ? lotSupplier : value.supplierId,
      supplierLotNumber: value.supplierLotNumber || lot?.supplierLotNumber || "",
    })
  }

  // a supplier lot typed with no lot chosen finds the lot that has it, or the document waits for that lot
  const lotWithSupplierLot = !value.lotId && value.supplierLotNumber.trim()
    ? documents.lots.find((l) => l.supplierLotNumber && sameSupplierLot(l.supplierLotNumber, value.supplierLotNumber))
    : undefined
  const chosenLot = documents.lots.find((l) => l.id === value.lotId)
  const printedMismatch = !!chosenLot?.supplierLotNumber && !!value.supplierLotNumber.trim() && !sameSupplierLot(chosenLot.supplierLotNumber, value.supplierLotNumber)

  const orderedFrom = documents.orderedFrom
  const orderedFromIds = new Set(orderedFrom.map((s) => s.id))
  const lastOrdered = orderedFrom.find((s) => s.id === value.supplierId)?.lastOrderedAt
  const supplierHint = lastOrdered
    ? `Last ordered from them ${formatDate(lastOrdered)}`
    : value.issuer === "internal"
      ? "Optional for our own documents"
      : "Who sent this document"

  // our document can point at the supplier version it was made from
  const sourceOptions = files.filter(
    (f) => f.id !== editingId && f.issuer === "supplier" && f.fileTypeId === value.fileTypeId
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Document type">
        {fileTypes.map((t) => {
          const active = value.fileTypeId === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => set("fileTypeId", t.id)}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition ${active ? "border-primary shadow-sm" : "border-transparent opacity-70 hover:opacity-100"}`}
              style={{ backgroundColor: t.bgColor, color: t.textColor }}
            >
              {t.name}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="Issued by">
          <div className="join">
            {(["supplier", "internal"] as const).map((issuer) => (
              <button
                key={issuer}
                type="button"
                aria-pressed={value.issuer === issuer}
                onClick={() => onChange({ ...value, issuer, derivedFromId: issuer === "internal" ? value.derivedFromId : "" })}
                className={`btn btn-sm join-item ${value.issuer === issuer ? "btn-primary" : "btn-ghost border-base-300"}`}
              >
                {issuer === "supplier" ? "Supplier" : "Us (internal / rebranded)"}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {expectations.notes.length > 0 && (
        <div className="rounded-lg bg-info/10 px-3 py-2 text-sm text-base-content/80">
          {expectations.notes.map((n) => <div key={n}>{n}</div>)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Supplier" hint={supplierHint}>
          <select className="select select-sm w-full" value={value.supplierId} onChange={(e) => { setSupplierPicked(true); set("supplierId", e.target.value) }}>
            <option value="">No supplier</option>
            {orderedFrom.length > 0 && (
              <optgroup label="This item is ordered from">
                {orderedFrom.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            )}
            <optgroup label={orderedFrom.length > 0 ? "All suppliers" : "Suppliers"}>
              {suppliers.filter((s) => !orderedFromIds.has(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          </select>
        </Field>

        <Field
          label={expectations.perLot ? "Lot" : "Lot (optional)"}
          hint={expectations.perLot ? "This document is required for each lot" : "Only for lot-specific documents like a COA"}
        >
          <select
            className={`select select-sm w-full ${expectations.perLot && !value.lotId ? "select-warning" : ""}`}
            value={value.lotId}
            onChange={(e) => selectLot(e.target.value)}
          >
            <option value="">Not lot-specific</option>
            {documents.lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.lotNumber}
                {l.supplierLotNumber ? ` · supplier lot ${l.supplierLotNumber}` : ""}
                {l.supplier ? ` · ${l.supplier.name}` : ""}
                {l.originType === "batchProduction" ? " · produced" : ""}
              </option>
            ))}
          </select>
        </Field>

        {(expectations.perLot || value.lotId || value.supplierLotNumber) && (
          <Field
            label="Supplier lot on the document"
            hint={
              printedMismatch
                ? <span className="text-warning">Differs from the lot&apos;s supplier lot ({chosenLot!.supplierLotNumber}); it&apos;ll show as a lot mismatch</span>
                : lotWithSupplierLot
                  ? `Goes on lot ${lotWithSupplierLot.lotNumber}, which has this supplier lot`
                  : !value.lotId && value.supplierLotNumber.trim()
                    ? "No lot has this supplier lot yet. It'll be attached when one is received with it."
                    : "As printed on the COA, so it can be matched to the right lot"
            }
          >
            <input
              className="input input-sm w-full font-mono"
              value={value.supplierLotNumber}
              onChange={(e) => set("supplierLotNumber", e.target.value.toUpperCase())}
              autoCorrect="off"
              spellCheck={false}
            />
          </Field>
        )}

        <Field label={expectations.needsIssueDate ? "Issue date" : "Issue date (optional)"} hint="The revision or issue date printed on the document">
          <input type="date" className="input input-sm w-full" value={value.issuedAt} onChange={(e) => set("issuedAt", e.target.value)} />
        </Field>

        <Field label="Expiry date (optional)" hint="Only if one is printed on it. Otherwise it's worked out from the requirement.">
          <input type="date" className="input input-sm w-full" value={value.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
        </Field>

        <Field label="Revision (optional)">
          <input className="input input-sm w-full" value={value.revision} onChange={(e) => set("revision", e.target.value)} placeholder="e.g. 4.0" />
        </Field>

        {value.issuer === "internal" && (
          <Field label="Based on (optional)" hint="If that supplier document is replaced, this one is flagged for review">
            <select className="select select-sm w-full" value={value.derivedFromId} onChange={(e) => set("derivedFromId", e.target.value)}>
              <option value="">Not based on a supplier document</option>
              {sourceOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.file.name}
                  {f.supplier ? ` · ${f.supplier.name}` : ""}
                  {f.issuedAt ? ` · ${formatDate(f.issuedAt)}` : ""}
                  {f.supersededAt ? " (replaced)" : ""}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
    </div>
  )
}

export default DocumentForm
