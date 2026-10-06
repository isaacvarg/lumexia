'use client'
import Link from "next/link"
import { TbReplace, TbSettings, TbUpload } from "react-icons/tb"
import { useItemSelection } from "@/store/itemSlice"
import { EvaluatedRequirement } from "@/lib/itemDocuments/types"
import { useFilesActions } from "./FilesContext"
import { formatDate, issuerLabel, needsAttention, statusDisplay, StatusBadge } from "./presentation"

const RequirementRow = ({ evaluated }: { evaluated: EvaluatedRequirement }) => {
  const { documents: itemDocuments, files } = useItemSelection()
  const { upload, preview } = useFilesActions()
  const { requirement, status, documents } = evaluated
  const fileType = itemDocuments.fileTypes.find((t) => t.id === requirement.fileTypeId)
  const best = documents[0]
  const file = best && files.find((f) => f.id === best.documentId)
  const others = documents.length - 1
  const optional = requirement.level === "optional"
  const display = statusDisplay[status]
  const Icon = display.icon

  const prefill = {
    fileTypeId: requirement.fileTypeId,
    issuer: requirement.issuer === "internal" ? ("internal" as const) : ("supplier" as const),
    supplierId: file?.supplierId ?? "",
    derivedFromId: "",
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${optional && status === "missing" ? "text-base-content/30" : display.text}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{fileType?.name}</span>
            <span className="text-sm text-base-content/50">{issuerLabel(requirement.issuer)}</span>
            {optional && <span className="badge badge-ghost badge-xs">optional</span>}
          </div>

          {file ? (
            <button type="button" onClick={() => preview(file)} className="group flex max-w-full flex-wrap items-center gap-x-2 text-left text-sm text-base-content/70">
              <span className="truncate group-hover:underline">{file.file.name}</span>
              {file.supplier && <span className="text-base-content/50">· {file.supplier.name}</span>}
              {file.issuedAt && <span className="text-base-content/50">· issued {formatDate(file.issuedAt)}</span>}
              {best.effectiveExpiresAt && <span className="text-base-content/50">· expires {formatDate(best.effectiveExpiresAt)}</span>}
              {others > 0 && <span className="text-base-content/50">· +{others} more</span>}
            </button>
          ) : (
            <p className="text-sm text-base-content/50">{requirement.notes ?? "Nothing on file yet"}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {(!optional || status !== "missing") && <StatusBadge status={status} />}
        <button
          type="button"
          onClick={() => upload(prefill)}
          className={`btn btn-sm ${needsAttention(status) && !optional ? "btn-primary" : "btn-ghost"}`}
        >
          {file ? <><TbReplace /> Replace</> : <><TbUpload /> Upload</>}
        </button>
      </div>
    </div>
  )
}

// Item-level requirements as a checklist; lot-level ones live in LotDocumentsPanel.
const RequirementsPanel = () => {
  const { documents } = useItemSelection()
  const itemLevel = documents.requirements
    .filter((r) => r.requirement.scope !== "lot")
    .sort((a, b) => (a.requirement.level === b.requirement.level ? 0 : a.requirement.level === "required" ? -1 : 1))

  if (documents.requirements.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-base-300 px-4 py-3 text-sm text-base-content/60">
        No document requirements apply to this item yet.
        <Link href="/settings/inventory" className="btn btn-ghost btn-sm"><TbSettings /> Set up requirements</Link>
      </div>
    )
  }

  if (itemLevel.length === 0) return null

  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <h3 className="border-b border-base-300 bg-base-200/60 px-4 py-2 font-semibold">Required documents</h3>
      <div className="flex flex-col divide-y divide-base-300">
        {itemLevel.map((r) => <RequirementRow key={r.requirement.id} evaluated={r} />)}
      </div>
    </section>
  )
}

export default RequirementsPanel
