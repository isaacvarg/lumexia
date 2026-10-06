'use client'
import { useState } from "react"
import { TbHistory, TbPencil, TbPlus } from "react-icons/tb"
import type { CanonEntry } from "@/lib/canon/queries"
import { getShapeKey, toCopyText } from "@/lib/canon/shapes"
import type { CanonAction } from "./CanonCard"
import StatusBadge from "./StatusBadge"

type Statement = { supplier: { id: string; name: string }; entry: CanonEntry }

type Props = {
  statements: Statement[]
  suppliers: { id: string; name: string }[]
  onAction: (entry: CanonEntry, action: CanonAction) => void
  onAdd: (supplierId: string) => void
  canAdd: boolean
}

// Supplier statements of an item fact: what individual suppliers say, under the item value they feed.
const SupplierStatements = ({ statements, suppliers, onAction, onAdd, canAdd }: Props) => {
  const [supplierId, setSupplierId] = useState("")
  const taken = new Set(statements.map((s) => s.supplier.id))

  return (
    <div className="flex flex-col gap-2 border-t border-base-300 pt-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Supplier statements</div>

      {statements.length === 0 && <p className="text-sm italic text-base-content/50">None recorded.</p>}

      {statements.map(({ supplier, entry }) => {
        const shapeKey = getShapeKey(entry.dataType.shapeId)
        const value = entry.artifact?.currentVersion?.content ?? null
        return (
          <div key={supplier.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-base-200/60 px-3 py-2">
            <span className="font-medium">{supplier.name}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-base-content/70">
              {value === null ? "No value yet" : toCopyText(shapeKey, value)}
            </span>
            <StatusBadge statusId={entry.artifact?.statusId ?? null} tooltip={false} />
            {entry.canEdit && (
              <button onClick={() => onAction(entry, "propose")} className="btn btn-ghost btn-xs" aria-label={`Change ${supplier.name}'s statement`}>
                <TbPencil className="size-4" />
              </button>
            )}
            {entry.artifact && (
              <button onClick={() => onAction(entry, "history")} className="btn btn-ghost btn-xs" aria-label={`${supplier.name} history`}>
                <TbHistory className="size-4" />
                {entry.artifact._count.changeRequests > 0 && <span className="badge badge-xs badge-warning">{entry.artifact._count.changeRequests}</span>}
              </button>
            )}
          </div>
        )
      })}

      {canAdd && <div className="flex gap-2">
        <select className="select select-xs flex-1" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} aria-label="Supplier">
          <option value="">Add a supplier&apos;s statement…</option>
          {suppliers.filter((s) => !taken.has(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => { onAdd(supplierId); setSupplierId("") }} disabled={!supplierId} className="btn btn-xs btn-secondary" aria-label="Add statement">
          <TbPlus className="size-3.5" />
        </button>
      </div>}
    </div>
  )
}

export default SupplierStatements
