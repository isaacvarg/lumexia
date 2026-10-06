'use client'
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { TbLink, TbQuestionMark } from "react-icons/tb"
import { CanonDataTypeRow } from "../types"
import { shapeIcons, subjectColors, subjectLabels } from "../presentation"

export type DataTypeNodeData = { dataType: CanonDataTypeRow; dimmed: boolean }
export type DataTypeFlowNode = Node<DataTypeNodeData, 'dataType'>

const handleClass = "!size-3 !bg-base-100 !border-2 !border-base-content/30 group-hover:!border-base-content/60"

const DataTypeNode = ({ data, selected }: NodeProps<DataTypeFlowNode>) => {
  const { dataType, dimmed } = data
  const Icon = shapeIcons[dataType.shapeId] ?? TbQuestionMark
  const color = subjectColors[dataType.subjectTypeId]

  return (
    <div
      className={`group relative flex w-60 items-center gap-3 rounded-xl border bg-base-100 px-3 py-3 shadow-sm transition-all
        ${selected ? `${color.border} ring-4 ${color.ring}` : 'border-base-300 hover:border-base-content/30'}
        ${dimmed ? 'opacity-25' : ''}`}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />

      {dataType.group && (
        <span className="absolute -top-2.5 left-3 rounded-full border border-base-300 bg-base-100 px-2 text-[10px] font-medium uppercase tracking-wide text-base-content/60">
          {dataType.group.name}
        </span>
      )}

      <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${color.bg} ${color.text}`}>
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-base-content">{dataType.name}</div>
        <div className="truncate text-xs text-base-content/60">
          {subjectLabels[dataType.subjectTypeId]?.label ?? dataType.subjectType.name} · {dataType.shape.name}
        </div>
      </div>

      {dataType.resolverKey && (
        <div className="tooltip tooltip-left" data-tip="Linked to Lumexia data">
          <TbLink className="size-4 text-base-content/50" />
        </div>
      )}

      <Handle type="source" position={Position.Right} className={`${handleClass} !size-3.5 cursor-crosshair`} />
    </div>
  )
}

export default DataTypeNode
