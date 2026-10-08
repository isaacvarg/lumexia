'use client'
import { TbAlertTriangle, TbCircleCheck, TbExternalLink, TbFile, TbTrash } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import type { ItemExpectations, ReceivingFileType, WaitingDocument } from "@/lib/receiving/queries"
import { sameSupplierLot } from "@/lib/itemDocuments/supplierLots"
import { StatusBadge } from "@/components/ItemDocuments/presentation"
import CaptureButtons from "./CaptureButtons"
import { DocumentDraft, isLinked, LineDraft, LotDraft, lotDocumentStates, newKey, Uploaded } from "./draft"

type Props = {
  item: PurchaseOrderItem
  line: LineDraft
  expectations: ItemExpectations | undefined
  fileTypes: ReceivingFileType[]
  onChange: (line: LineDraft) => void
}

const TypeChip = ({ type }: { type: ReceivingFileType | undefined }) =>
  type ? (
    <span className="rounded-md px-2 py-0.5 text-sm font-semibold" style={{ backgroundColor: type.bgColor, color: type.textColor }}>
      {type.abbreviaton || type.name}
    </span>
  ) : null

const lotTitle = (lot: LotDraft, index: number) => `Lot ${index + 1}${lot.supplierLotNumber.trim() ? ` · ${lot.supplierLotNumber.trim().toUpperCase()}` : ""}`

const DocumentsStep = ({ line, expectations, fileTypes, onChange }: Props) => {
  const typeOf = (id: string) => fileTypes.find((t) => t.id === id)
  const waiting = expectations?.waitingDocuments ?? []

  const addDocuments = (files: Uploaded[], fileTypeId: string, lotKey: string | null) =>
    onChange({
      ...line,
      documents: [...line.documents, ...files.map((f): DocumentDraft => ({ ...f, key: newKey(), fileTypeId, lotKey, issuedAt: "" }))],
    })
  const setDocument = (key: string, patch: Partial<DocumentDraft>) =>
    onChange({ ...line, documents: line.documents.map((d) => (d.key === key ? { ...d, ...patch } : d)) })
  const setLink = (lot: LotDraft, docId: string, linked: boolean) =>
    onChange({ ...line, lots: line.lots.map((l) => (l.key === lot.key ? { ...l, linkChoices: { ...l.linkChoices, [docId]: linked } } : l)) })

  // documents emailed for this order whose supplier lot matches none of the lots entered
  const unmatched = waiting.filter((d) => d.forThisOrder && !line.lots.some((l) => isLinked(l, d)))

  const waitingRow = (lot: LotDraft, doc: WaitingDocument) => {
    const matches = sameSupplierLot(doc.supplierLotNumber, lot.supplierLotNumber)
    return (
      <label key={doc.id} className="flex cursor-pointer items-center gap-3 rounded-lg bg-base-200/60 p-3">
        <input type="checkbox" className="checkbox checkbox-lg" checked={isLinked(lot, doc)} onChange={(e) => setLink(lot, doc.id, e.target.checked)} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{doc.file.name}</span>
          <span className={`text-sm ${matches ? "text-success" : "text-warning"}`}>
            {matches ? "Matches supplier lot " : "Printed for supplier lot "}
            <span className="font-mono">{doc.supplierLotNumber}</span>
            {doc.supplier && ` · ${doc.supplier.name}`}
          </span>
        </span>
        {doc.file.url && (
          <a href={doc.file.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" onClick={(e) => e.stopPropagation()}>
            <TbExternalLink className="size-5" /> View
          </a>
        )}
      </label>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-base-content/70">
        Attach the paperwork that came with the delivery. Anything missing is fine for now; it&apos;s flagged until it arrives.
      </p>

      {line.lots.map((lot, index) => {
        const states = lotDocumentStates(lot, line, expectations)
        return (
          <section key={lot.key} className="flex flex-col gap-3 rounded-box border border-base-300 p-4">
            <h3 className="text-lg font-semibold">{lotTitle(lot, index)}</h3>
            {states.length === 0 && <p className="text-base-content/60">No lot documents are required for this item.</p>}
            {states.map((s) => (
              <div key={s.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeChip type={typeOf(s.fileTypeId)} />
                  {s.state === "missing" ? (
                    <span className={`flex items-center gap-1 ${s.level === "required" ? "text-warning" : "text-base-content/60"}`}>
                      <TbAlertTriangle className="size-4" /> {s.level === "required" ? "Required, not on file yet" : "Optional, not on file"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-success">
                      <TbCircleCheck className="size-4" /> {s.state === "onFile" ? "On file" : "Added now"}
                    </span>
                  )}
                </div>
                {s.notes && <p className="text-sm text-base-content/60">{s.notes}</p>}
                {waiting
                  .filter((d) => d.fileTypeId === s.fileTypeId && (isLinked(lot, d) || sameSupplierLot(d.supplierLotNumber, lot.supplierLotNumber)))
                  .map((d) => waitingRow(lot, d))}
                {s.state === "missing" && (
                  <CaptureButtons
                    size="md"
                    pathPrefix="/item/"
                    cameraLabel={`Photo of ${typeOf(s.fileTypeId)?.abbreviaton || "document"}`}
                    fileLabel="Upload PDF"
                    onUploaded={(files) => addDocuments(files, s.fileTypeId, lot.key)}
                  />
                )}
              </div>
            ))}
          </section>
        )
      })}

      {unmatched.length > 0 && (
        <section className="flex flex-col gap-3 rounded-box border-2 border-warning/40 bg-warning/5 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TbAlertTriangle className="size-5 text-warning" /> On file for this order, but for another supplier lot
          </h3>
          <p className="text-base-content/70">
            Check the supplier lot on the containers. If the document is for one of these lots anyway, attach it; it&apos;ll be flagged as a lot mismatch.
          </p>
          {unmatched.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-2">
              <TypeChip type={typeOf(d.fileTypeId)} />
              <span className="font-medium">{d.file.name}</span>
              <span className="font-mono text-warning">{d.supplierLotNumber}</span>
              {d.file.url && <a href={d.file.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><TbExternalLink /> View</a>}
              {line.lots.map((lot, index) => (
                <button key={lot.key} type="button" className="btn btn-outline" onClick={() => setLink(lot, d.id, true)}>
                  Attach to {lotTitle(lot, index)}
                </button>
              ))}
            </div>
          ))}
        </section>
      )}

      {(expectations?.itemGaps.length ?? 0) > 0 && (
        <section className="flex flex-col gap-3 rounded-box border border-base-300 p-4">
          <h3 className="text-lg font-semibold">While you have the paperwork</h3>
          <p className="text-base-content/70">These item documents need attention. If a current one came in the box, add it here.</p>
          {expectations!.itemGaps.map((g) => {
            const added = line.documents.filter((d) => d.lotKey === null && d.fileTypeId === g.fileTypeId)
            return (
              <div key={g.requirementId} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeChip type={typeOf(g.fileTypeId)} />
                  {added.length > 0 ? (
                    <span className="flex items-center gap-1 text-success"><TbCircleCheck className="size-4" /> Added now</span>
                  ) : (
                    <StatusBadge status={g.status} />
                  )}
                </div>
                {added.length === 0 && (
                  <CaptureButtons size="md" pathPrefix="/item/" cameraLabel="Photo" fileLabel="Upload PDF" onUploaded={(files) => addDocuments(files, g.fileTypeId, null)} />
                )}
              </div>
            )
          })}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Other documents</h3>
        <CaptureButtons size="md" pathPrefix="/item/" cameraLabel="Photo" fileLabel="Upload file" onUploaded={(files) => addDocuments(files, "", line.lots[0]?.key ?? null)} />
        {line.documents.length > 0 && (
          <ul className="flex flex-col gap-3">
            {line.documents.map((d) => (
              <li key={d.key} className="flex flex-col gap-3 rounded-lg bg-base-200/60 p-3">
                <div className="flex items-center gap-2">
                  <TbFile className="size-5 shrink-0 text-base-content/50" />
                  <span className="flex-1 truncate font-medium">{d.name}</span>
                  <button type="button" className="btn btn-ghost text-error" aria-label={`Remove ${d.name}`} onClick={() => onChange({ ...line, documents: line.documents.filter((x) => x.key !== d.key) })}>
                    <TbTrash className="size-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Document type">
                  {fileTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={d.fileTypeId === t.id}
                      onClick={() => setDocument(d.key, { fileTypeId: t.id })}
                      className={`rounded-lg border-2 px-3 py-1.5 font-medium ${d.fileTypeId === t.id ? "border-primary shadow-sm" : "border-transparent opacity-60"}`}
                      style={{ backgroundColor: t.bgColor, color: t.textColor }}
                    >
                      {t.abbreviaton || t.name}
                    </button>
                  ))}
                </div>
                {!d.fileTypeId && <span className="text-sm text-warning">Pick a type, or it won&apos;t be filed.</span>}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">For</span>
                    <select className="select select-lg w-full" value={d.lotKey ?? ""} onChange={(e) => setDocument(d.key, { lotKey: e.target.value || null })}>
                      {line.lots.map((l, i) => <option key={l.key} value={l.key}>{lotTitle(l, i)}</option>)}
                      <option value="">The item (not lot-specific)</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Issue date <span className="font-normal text-base-content/50">(optional)</span></span>
                    <input type="date" className="input input-lg w-full" value={d.issuedAt} onChange={(e) => setDocument(d.key, { issuedAt: e.target.value })} />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default DocumentsStep
