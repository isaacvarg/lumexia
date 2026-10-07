'use client'
import { useState } from "react"
import { TbEye } from "react-icons/tb"
import Card from "@/components/Card"
import { DocumentRequirementRow } from "@/actions/inventory/documentRequirements"
import { resolveRequirements } from "@/lib/itemDocuments/evaluate"
import { requirementIssuers } from "@/lib/itemDocuments/rules"
import { validityText } from "./RequirementRow"
import { Option } from "./types"

type Props = {
  requirements: DocumentRequirementRow[]
  itemTypes: Option[]
  procurementTypes: Option[]
  matchLabel: (r: Pick<DocumentRequirementRow, "itemType" | "procurementType" | "sold">) => string
}

// Shows what an item with a given item type + procurement type ends up needing once precedence is applied.
const RequirementPreview = ({ requirements, itemTypes, procurementTypes, matchLabel }: Props) => {
  const [itemTypeId, setItemTypeId] = useState(itemTypes[0]?.id ?? "")
  const [procurementTypeId, setProcurementTypeId] = useState(procurementTypes[0]?.id ?? "")
  const [isSold, setIsSold] = useState(false)

  const resolved = resolveRequirements(requirements, { itemTypeId, procurementTypeId, isSold }) as DocumentRequirementRow[]
  const sorted = [...resolved].sort((a, b) =>
    a.level === b.level ? a.fileType.name.localeCompare(b.fileType.name) : a.level === "required" ? -1 : 1
  )

  return (
    <Card.Root>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <TbEye className="size-5 text-primary" />
          <h3 className="font-semibold">Preview an item</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Item type" className="select select-sm" value={itemTypeId} onChange={(e) => setItemTypeId(e.target.value)}>
            {itemTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select aria-label="Procurement type" className="select select-sm capitalize" value={procurementTypeId} onChange={(e) => setProcurementTypeId(e.target.value)}>
            {procurementTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="toggle toggle-sm" checked={isSold} onChange={(e) => setIsSold(e.target.checked)} />
          Sold to customers
        </label>

        {sorted.length === 0 ? (
          <p className="text-sm italic text-base-content/50">No documents needed.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-base-300">
            {sorted.map((r) => (
              <li key={r.id} className="flex flex-col gap-0.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {r.fileType.name}
                    <span className="font-normal text-base-content/50">
                      {" "}· {requirementIssuers.find((i) => i.value === r.issuer)?.label.toLowerCase()}
                      {r.scope === "lot" && " · per lot"}
                    </span>
                  </span>
                  <span className={`badge badge-sm ${r.level === "required" ? "badge-primary" : "badge-ghost"}`}>{r.level}</span>
                </div>
                <span className="text-xs text-base-content/50">{validityText(r)} · from {matchLabel(r)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card.Root>
  )
}

export default RequirementPreview
