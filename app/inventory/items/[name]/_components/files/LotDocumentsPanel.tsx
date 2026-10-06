'use client'
import { useState } from "react"
import { TbMinus } from "react-icons/tb"
import { useItemSelection } from "@/store/itemSlice"
import { useFilesActions } from "./FilesContext"
import { formatDate, issuerLabel, statusDisplay } from "@/components/ItemDocuments/presentation"

const originLabel: Record<string, string> = {
  purchaseOrderReceiving: "Received",
  batchProduction: "Produced",
  manuallyCreated: "Manual",
}

// One row per lot, one column per lot-level requirement. Lots that don't need a document (wrong origin,
// or older and used up) are hidden until "show all lots" is on.
const LotDocumentsPanel = () => {
  const { documents, files } = useItemSelection()
  const { upload, preview } = useFilesActions()
  const [showAll, setShowAll] = useState(false)

  const lotRequirements = documents.requirements.filter((r) => r.requirement.scope === "lot")
  if (lotRequirements.length === 0) return null

  const fileTypeLabel = (id: string) => {
    const t = documents.fileTypes.find((f) => f.id === id)
    return t?.abbreviaton || t?.name
  }
  const entryFor = (requirementIndex: number, lotId: string) =>
    lotRequirements[requirementIndex].lots?.find((l) => l.lotId === lotId)
  const counted = new Set(lotRequirements.flatMap((r) => (r.lots ?? []).filter((l) => l.counted).map((l) => l.lotId)))
  const lots = documents.lots.filter((l) => showAll || counted.has(l.id))
  const hiddenCount = documents.lots.length - counted.size

  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 bg-base-200/60 px-4 py-2">
        <h3 className="font-semibold">Lot documents</h3>
        {hiddenCount > 0 && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-base-content/60">
            <input type="checkbox" className="toggle toggle-xs" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show all lots ({hiddenCount} don&apos;t need documents)
          </label>
        )}
      </div>

      {lots.length === 0 ? (
        <p className="px-4 py-3 text-sm text-base-content/50">No lots need documents right now.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Lot</th>
                {lotRequirements.map((r) => (
                  <th key={r.requirement.id}>
                    {fileTypeLabel(r.requirement.fileTypeId)}
                    <span className="ml-1 font-normal text-base-content/50">{issuerLabel(r.requirement.issuer)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className={counted.has(lot.id) ? "" : "opacity-50"}>
                  <td>
                    <div className="font-medium">{lot.lotNumber}</div>
                    <div className="text-xs text-base-content/50">
                      {originLabel[lot.originType ?? ""] ?? "Unknown origin"} · {formatDate(lot.createdAt)}
                      {lot.supplier && ` · ${lot.supplier.name}`}
                    </div>
                  </td>
                  {lotRequirements.map((r, i) => {
                    const entry = entryFor(i, lot.id)
                    if (!entry || !entry.counted) {
                      return (
                        <td key={r.requirement.id} title="Not needed for this lot">
                          <TbMinus className="size-4 text-base-content/30" />
                        </td>
                      )
                    }
                    const display = statusDisplay[entry.status]
                    const Icon = display.icon
                    const file = entry.documents[0] && files.find((f) => f.id === entry.documents[0].documentId)
                    return (
                      <td key={r.requirement.id}>
                        <button
                          type="button"
                          title={file ? file.file.name : `Upload for lot ${lot.lotNumber}`}
                          onClick={() =>
                            file
                              ? preview(file)
                              : upload({
                                  fileTypeId: r.requirement.fileTypeId,
                                  issuer: r.requirement.issuer === "internal" ? "internal" : "supplier",
                                  lotId: lot.id,
                                  supplierId: r.requirement.issuer === "internal" ? "" : lot.supplier?.id ?? "",
                                })
                          }
                          className={`badge badge-soft badge-sm ${display.badge} gap-1 hover:brightness-95`}
                        >
                          <Icon className="size-3.5" />
                          {file ? display.label : "Upload"}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default LotDocumentsPanel
