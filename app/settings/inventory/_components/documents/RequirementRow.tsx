'use client'
import { useRouter } from "next/navigation"
import { TbPencil, TbTrash } from "react-icons/tb"
import { deleteDocumentRequirement, DocumentRequirementRow } from "@/actions/inventory/documentRequirements"
import { requirementIssuers, requirementLevels } from "@/lib/itemDocuments/rules"

const levelClass: Record<string, string> = {
  required: "badge-primary",
  optional: "badge-ghost",
  excluded: "badge-error badge-soft",
}

export const validityText = (r: Pick<DocumentRequirementRow, "level" | "validForMonths" | "warnDays" | "minIssuedAt">) => {
  if (r.level === "excluded") return "Not needed for these items"
  const parts: string[] = []
  if (r.validForMonths) parts.push(`Valid ${r.validForMonths} mo · warn ${r.warnDays} d before`)
  if (r.minIssuedAt) parts.push(`Issued on/after ${new Date(r.minIssuedAt).toISOString().slice(0, 10)}`)
  return parts.length ? parts.join(" · ") : "No expiry"
}

const RequirementRow = ({ requirement, onEdit }: { requirement: DocumentRequirementRow; onEdit: () => void }) => {
  const router = useRouter()
  const { fileType } = requirement
  const issuer = requirementIssuers.find((i) => i.value === requirement.issuer)?.label
  const level = requirementLevels.find((l) => l.value === requirement.level)?.label

  const remove = async () => {
    if (!confirm(`Remove the ${fileType.name} requirement?`)) return
    await deleteDocumentRequirement(requirement.id)
    router.refresh()
  }

  return (
    <div className={`group flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 ${requirement.level === "excluded" ? "opacity-70" : ""}`}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 md:min-w-56">
        <span
          className="rounded-md px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: fileType.bgColor, color: fileType.textColor }}
        >
          {fileType.abbreviaton || fileType.name}
        </span>
        <span className={`font-medium ${requirement.level === "excluded" ? "line-through" : ""}`}>{fileType.name}</span>
        <span className="whitespace-nowrap text-sm text-base-content/50">from {issuer?.toLowerCase()}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`badge badge-sm ${levelClass[requirement.level]}`}>{level}</span>
        {requirement.level !== "excluded" && (
          <span className="badge badge-sm badge-outline">{requirement.scope === "lot" ? "Per lot" : "Per item"}</span>
        )}
      </div>

      <div className="w-full text-sm text-base-content/60 md:w-72">
        {validityText(requirement)}
        {requirement.notes && <div className="truncate italic" title={requirement.notes}>{requirement.notes}</div>}
      </div>

      <div className="flex gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button onClick={onEdit} className="btn btn-ghost btn-sm btn-square" aria-label={`Edit ${fileType.name} requirement`}><TbPencil /></button>
        <button onClick={remove} className="btn btn-error btn-soft btn-sm btn-square" aria-label={`Remove ${fileType.name} requirement`}><TbTrash /></button>
      </div>
    </div>
  )
}

export default RequirementRow
