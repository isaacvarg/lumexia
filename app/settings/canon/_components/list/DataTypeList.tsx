'use client'
import { TbAlertTriangle, TbLink, TbQuestionMark } from "react-icons/tb"
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities"
import { CanonDataTypeRow, CanonSettingsData } from "../types"
import { dependencyKindLabels, shapeIcons, subjectColors, subjectLabels } from "../presentation"

const grantees = (dataType: CanonDataTypeRow, capabilityId: string) => [
  ...dataType.teamPermissions.filter((p) => p.capabilityId === capabilityId).map((p) => p.team.name),
  ...dataType.userPermissions.filter((p) => p.capabilityId === capabilityId).map((p) => p.user.name ?? "Unnamed user"),
]

const Grantees = ({ names, missing }: { names: string[]; missing: string | null }) =>
  names.length > 0 ? (
    <span className="text-sm">{names.join(", ")}</span>
  ) : missing ? (
    <span className="inline-flex items-center gap-1 text-sm text-warning"><TbAlertTriangle className="size-4" /> {missing}</span>
  ) : (
    <span className="text-sm text-base-content/40">—</span>
  )

const Row = ({ dataType, byId, onOpen }: { dataType: CanonDataTypeRow; byId: Map<string, CanonDataTypeRow>; onOpen: () => void }) => {
  const Icon = shapeIcons[dataType.shapeId] ?? TbQuestionMark
  const color = subjectColors[dataType.subjectTypeId]
  const isLinked = !!dataType.resolverKey

  return (
    <tr className="hover cursor-pointer" onClick={onOpen}>
      <td>
        <div className="flex items-center gap-3">
          <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${color.bg} ${color.text}`}>
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 font-medium">
              {dataType.name}
              {isLinked && <TbLink className="size-4 text-base-content/50" />}
            </div>
            {dataType.description && <div className="max-w-xs truncate text-xs text-base-content/60">{dataType.description}</div>}
          </div>
        </div>
      </td>
      <td className="text-sm">
        {subjectLabels[dataType.subjectTypeId]?.label ?? dataType.subjectType.name}
        {dataType.allowSupplierStatements && <div className="text-xs text-base-content/50">+ supplier statements</div>}
      </td>
      <td className="text-sm">{dataType.shape.name}</td>
      <td>
        {/* linked types are edited at their source, so only reviewers matter */}
        {isLinked
          ? <span className="text-sm text-base-content/50">At source</span>
          : <Grantees names={grantees(dataType, canonCapabilities.edit)} missing="Nobody" />}
      </td>
      <td><Grantees names={grantees(dataType, canonCapabilities.review)} missing="Nobody" /></td>
      <td className="text-sm">
        {dataType.parents.length === 0 ? (
          <span className="text-base-content/40">—</span>
        ) : (
          dataType.parents.map((dep) => (
            <div key={dep.id}>
              {byId.get(dep.parentId)?.name}
              <span className="text-base-content/50"> · {dependencyKindLabels[dep.kindId]?.label}</span>
            </div>
          ))
        )}
      </td>
      <td className="text-right tabular-nums">{dataType._count.artifacts}</td>
    </tr>
  )
}

type Props = {
  settings: CanonSettingsData
  matchIds: Set<string> | null
  onOpen: (id: string) => void
}

// Every data type in one table, sectioned by group in the groups' order.
const DataTypeList = ({ settings, matchIds, onOpen }: Props) => {
  const { dataTypes, groups } = settings
  const byId = new Map(dataTypes.map((d) => [d.id, d]))
  const visible = dataTypes.filter((d) => !matchIds || matchIds.has(d.id))

  const sections = [
    ...groups.map((g) => ({ key: g.id, title: g.name, rows: visible.filter((d) => d.groupId === g.id) })),
    { key: "none", title: "No group", rows: visible.filter((d) => !d.groupId) },
  ].filter((s) => s.rows.length > 0)

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-base-300 py-10 text-center text-base-content/60">
        {dataTypes.length === 0 ? "No data types yet." : "No data types match."}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>Data type</th><th>Applies to</th><th>Shape</th><th>Editors</th><th>Reviewers</th><th>Depends on</th>
            <th className="text-right">Artifacts</th>
          </tr>
        </thead>
        {sections.map((section) => (
          <tbody key={section.key}>
            <tr className="bg-base-200/60">
              <td colSpan={7} className="py-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
                {section.title} <span className="font-normal text-base-content/50">· {section.rows.length}</span>
              </td>
            </tr>
            {section.rows.map((d) => <Row key={d.id} dataType={d} byId={byId} onOpen={() => onOpen(d.id)} />)}
          </tbody>
        ))}
      </table>
    </div>
  )
}

export default DataTypeList
