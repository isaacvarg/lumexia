'use client'
import { useState } from "react"
import { useItemSelection } from "@/store/itemSlice"
import { ItemDocumentDetails } from "../../_actions/files/itemDocumentMutations"
import { formatDate, fromDateInput, toDateInput } from "@/components/ItemDocuments/presentation"

export type DocumentFormValue = {
  fileTypeId: string
  issuer: "supplier" | "internal"
  supplierId: string
  lotId: string
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
  issuedAt: toDateInput(d.issuedAt),
  expiresAt: toDateInput(d.expiresAt),
  revision: d.revision ?? "",
  derivedFromId: d.derivedFromId ?? "",
})

export const fromDocumentForm = (v: DocumentFormValue): ItemDocumentDetails => ({
  fileTypeId: v.fileTypeId,
  issuer: v.issuer,
  supplierId: v.supplierId || null,
  lotId: v.lotId || null,
  issuedAt: fromDateInput(v.issuedAt),
  expiresAt: fromDateInput(v.expiresAt),
  revision: v.revision || null,
  derivedFromId: v.issuer === "internal" ? v.derivedFromId || null : null,
})

// What the item's requirements expect for the chosen file type + issuer, used to guide the form.
export const useDocumentExpectations = (v: Pick<DocumentFormValue, "fileTypeId" | "issuer">) => {
  const { documents } = useItemSelection()
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
  const { options, documents, files } = useItemSelection()
  const expectations = useDocumentExpectations(value)
  const set = <K extends keyof DocumentFormValue>(key: K, v: DocumentFormValue[K]) => onChange({ ...value, [key]: v })

  // a supplier picked by hand is never overwritten; one that was prefilled is
  const [supplierPicked, setSupplierPicked] = useState(!!editingId && !!value.supplierId)

  const selectLot = (lotId: string) => {
    const lot = documents.lots.find((l) => l.id === lotId)
    // a received lot already knows its supplier
    const lotSupplier = value.issuer === "supplier" ? lot?.supplier?.id : undefined
    onChange({ ...value, lotId, supplierId: !supplierPicked && lotSupplier ? lotSupplier : value.supplierId })
  }

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
        {options.itemFileTypes.map((t) => {
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
              {options.suppliers.filter((s) => !orderedFromIds.has(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                {l.supplier ? ` · ${l.supplier.name}` : ""}
                {l.originType === "batchProduction" ? " · produced" : ""}
              </option>
            ))}
          </select>
        </Field>

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
