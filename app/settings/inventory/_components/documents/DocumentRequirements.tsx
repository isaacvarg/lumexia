'use client'
import { useState } from "react"
import { TbFileCertificate, TbPlus } from "react-icons/tb"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { DocumentRequirementRow } from "@/actions/inventory/documentRequirements"
import RequirementForm from "./RequirementForm"
import RequirementRow from "./RequirementRow"
import RequirementPreview from "./RequirementPreview"
import { FileTypeOption, Option } from "./types"

type Props = {
  requirements: DocumentRequirementRow[]
  itemTypes: Option[]
  procurementTypes: Option[]
  fileTypes: FileTypeOption[]
}

type Group = {
  key: string
  itemTypeId: string | null
  procurementTypeId: string | null
  sold: boolean | null
  label: string
  rules: DocumentRequirementRow[]
}

// "new" = the add form at the top; "group:<key>" = add form inside a group; otherwise a requirement id being edited
type Editing = null | "new" | `group:${string}` | string

const byName = <T extends Option>(options: T[]) => [...options].sort((a, b) => a.name.localeCompare(b.name))

const DocumentRequirements = ({ requirements, ...props }: Props) => {
  const [editing, setEditing] = useState<Editing>(null)
  const itemTypes = byName(props.itemTypes)
  const procurementTypes = byName(props.procurementTypes)
  const fileTypes = byName(props.fileTypes)

  const matchLabel = (r: Pick<DocumentRequirementRow, "itemType" | "procurementType" | "sold">) => {
    const sold = r.sold === true ? "Sold" : r.sold === false ? "Not sold" : null
    const parts = [r.itemType?.name, r.procurementType?.name, sold].filter(Boolean)
    if (r.itemType) return parts.join(" · ")
    return `All ${parts.join(" · ").toLowerCase()} items`
  }

  // Broad procurement-type rules first, then item types alphabetically, each followed by its narrower combinations.
  const groups = Array.from(
    requirements
      .reduce((map, r) => {
        const key = `${r.itemTypeId ?? ""}:${r.procurementTypeId ?? ""}:${r.sold ?? ""}`
        const group = map.get(key) ?? { key, itemTypeId: r.itemTypeId, procurementTypeId: r.procurementTypeId, sold: r.sold, label: matchLabel(r), rules: [] }
        group.rules.push(r)
        return map.set(key, group)
      }, new Map<string, Group>())
      .values()
  ).sort((a, b) => {
    if (!a.itemTypeId !== !b.itemTypeId) return a.itemTypeId ? 1 : -1
    return a.label.localeCompare(b.label)
  })

  const formProps = { itemTypes, procurementTypes, fileTypes, onDone: () => setEditing(null) }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Document Requirements</SectionTitle>
        <button onClick={() => setEditing(editing === "new" ? null : "new")} className="btn btn-secondary" aria-label="Add requirement">
          <TbPlus className="size-4" />
        </button>
      </div>

      <p className="max-w-3xl text-base-content/70">
        Set which documents items need, by item type, procurement type and whether the item is sold. When rules
        overlap for the same document and issuer, the most specific one wins, so you can require something for all
        purchased items and mark it optional or excluded for one item type.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {editing === "new" && <RequirementForm {...formProps} />}

          {groups.length === 0 && editing !== "new" && (
            <Card.Root>
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <TbFileCertificate className="size-10 text-base-content/30" />
                <p className="text-base-content/60">No document requirements yet.</p>
                <button onClick={() => setEditing("new")} className="btn btn-primary btn-sm">Add the first one</button>
              </div>
            </Card.Root>
          )}

          {groups.map((group) => (
            <div key={group.key} className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
              <div className="flex items-center justify-between border-b border-base-300 bg-base-200/60 px-4 py-2">
                <h3 className="font-semibold capitalize">{group.label}</h3>
                <button
                  onClick={() => setEditing(`group:${group.key}`)}
                  className="btn btn-ghost btn-xs"
                >
                  <TbPlus /> Add
                </button>
              </div>
              <div className="flex flex-col divide-y divide-base-300">
                {group.rules.map((r) =>
                  editing === r.id ? (
                    <div key={r.id} className="p-3"><RequirementForm {...formProps} requirement={r} /></div>
                  ) : (
                    <RequirementRow key={r.id} requirement={r} onEdit={() => setEditing(r.id)} />
                  )
                )}
                {editing === `group:${group.key}` && (
                  <div className="p-3">
                    <RequirementForm
                      {...formProps}
                      defaults={{ itemTypeId: group.itemTypeId, procurementTypeId: group.procurementTypeId, sold: group.sold }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="lg:sticky lg:top-4">
            <RequirementPreview
              requirements={requirements}
              itemTypes={itemTypes}
              procurementTypes={procurementTypes}
              matchLabel={matchLabel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentRequirements
