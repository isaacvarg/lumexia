'use client'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TbGripVertical } from "react-icons/tb"
import { HomeDashPanel } from "@/actions/users/homeDash/getHomeDashLayout"
import { PanelSpan } from "@/app/_components/panels/registry"

type Props = {
  panel: HomeDashPanel
  onToggle: (enabled: boolean) => void
  onSpanChange: (span: PanelSpan) => void
}

const spanOptions: { value: PanelSpan; label: string }[] = [
  { value: 1, label: 'Small' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Full' },
]

const SortablePanelRow = ({ panel, onToggle, onSpanChange }: Props) => {

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: panel.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-base-200 bg-base-100 p-3"
    >
      <button
        type="button"
        className="btn btn-ghost btn-xs cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <TbGripVertical />
      </button>

      <span className="font-poppins font-medium text-base-content flex-1">{panel.label}</span>

      <select
        className="select select-bordered select-sm"
        value={panel.span}
        onChange={(e) => onSpanChange(Number(e.target.value) as PanelSpan)}
        disabled={!panel.enabled}
      >
        {spanOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={panel.enabled}
        onChange={(e) => onToggle(e.target.checked)}
        aria-label={`Toggle ${panel.label}`}
      />
    </div>
  )
}

export default SortablePanelRow
