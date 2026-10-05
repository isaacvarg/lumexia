'use client'
import { TbArrowDown, TbArrowUp, TbPlus, TbX } from "react-icons/tb"
import { CanonShapeKey } from "@/lib/canon/shapes"

type EditorProps = {
  shapeKey: CanonShapeKey
  value: any
  onChange: (value: any) => void
  tagOptions: string[]
}

// Empty content for a shape, used when an artifact has no version yet.
export const emptyContent = (shapeKey: CanonShapeKey): any => {
  switch (shapeKey) {
    case "text": return { text: "" }
    case "richText": return { html: "", plain: "" }
    case "boolean": return { value: false }
    case "orderedList": return { items: [] }
    case "tagSet": return { tags: [] }
    case "blockList": return { blocks: [] }
    case "keyValue": return { rows: [] }
    case "composition": return { rows: [] }
    case "billOfMaterials": return { rows: [] }
  }
}

const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

const RowControls = ({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void }) => (
  <div className="flex shrink-0 gap-1">
    <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up"><TbArrowUp /></button>
    <button type="button" className="btn btn-ghost btn-xs btn-square" disabled={index === length - 1} onClick={() => onMove(index + 1)} aria-label="Move down"><TbArrowDown /></button>
    <button type="button" className="btn btn-ghost btn-xs btn-square text-error" onClick={onRemove} aria-label="Remove"><TbX /></button>
  </div>
)

const numberOrNull = (v: string) => (v.trim() === "" ? null : Number(v))

// Editing UI for each shape. Linked shapes (bill of materials) are never edited here.
const ContentEditor = ({ shapeKey, value, onChange, tagOptions }: EditorProps) => {
  switch (shapeKey) {
    case "text":
      return <textarea className="textarea w-full" rows={3} value={value.text} onChange={(e) => onChange({ text: e.target.value })} />

    case "richText":
      // stored as plain text for now; html mirrors it until a rich editor is added
      return (
        <textarea
          className="textarea w-full"
          rows={6}
          value={value.plain}
          onChange={(e) => onChange({ plain: e.target.value, html: e.target.value })}
        />
      )

    case "boolean":
      return (
        <label className="label cursor-pointer justify-start gap-3">
          <input type="checkbox" className="toggle toggle-primary" checked={value.value} onChange={(e) => onChange({ value: e.target.checked })} />
          <span>{value.value ? "Yes" : "No"}</span>
        </label>
      )

    case "orderedList": {
      const items: string[] = value.items
      return (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-right text-sm text-base-content/50">{i + 1}.</span>
              <input className="input input-sm flex-1" value={item} onChange={(e) => onChange({ items: items.map((it, j) => (j === i ? e.target.value : it)) })} />
              <RowControls index={i} length={items.length} onMove={(to) => onChange({ items: move(items, i, to) })} onRemove={() => onChange({ items: items.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => onChange({ items: [...items, ""] })}><TbPlus /> Add item</button>
        </div>
      )
    }

    case "tagSet": {
      const tags: string[] = value.tags
      const toggle = (tag: string) => onChange({ tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] })
      return (
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => (
            <button key={tag} type="button" onClick={() => toggle(tag)} className={`badge badge-lg cursor-pointer ${tags.includes(tag) ? "badge-primary" : "badge-ghost"}`}>
              {tag}
            </button>
          ))}
        </div>
      )
    }

    case "blockList": {
      const blocks: { title: string; body: string }[] = value.blocks
      const set = (i: number, patch: Partial<{ title: string; body: string }>) => onChange({ blocks: blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)) })
      return (
        <div className="flex flex-col gap-3">
          {blocks.map((block, i) => (
            <div key={i} className="flex gap-2 rounded-lg border border-base-300 p-3">
              <div className="flex flex-1 flex-col gap-2">
                <input className="input input-sm w-full font-semibold" placeholder="Title" value={block.title} onChange={(e) => set(i, { title: e.target.value })} />
                <textarea className="textarea textarea-sm w-full" rows={3} placeholder="Body" value={block.body} onChange={(e) => set(i, { body: e.target.value })} />
              </div>
              <RowControls index={i} length={blocks.length} onMove={(to) => onChange({ blocks: move(blocks, i, to) })} onRemove={() => onChange({ blocks: blocks.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => onChange({ blocks: [...blocks, { title: "", body: "" }] })}><TbPlus /> Add block</button>
        </div>
      )
    }

    case "keyValue": {
      const rows: { key: string; value: string }[] = value.rows
      const set = (i: number, patch: Partial<{ key: string; value: string }>) => onChange({ rows: rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
      return (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input input-sm w-2/5" placeholder="Property" value={row.key} onChange={(e) => set(i, { key: e.target.value })} />
              <input className="input input-sm flex-1" placeholder="Value" value={row.value} onChange={(e) => set(i, { value: e.target.value })} />
              <RowControls index={i} length={rows.length} onMove={(to) => onChange({ rows: move(rows, i, to) })} onRemove={() => onChange({ rows: rows.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => onChange({ rows: [...rows, { key: "", value: "" }] })}><TbPlus /> Add property</button>
        </div>
      )
    }

    case "composition": {
      type Row = { inci: string; cas: string | null; percentMin: number | null; percentMax: number | null }
      const rows: Row[] = value.rows
      const set = (i: number, patch: Partial<Row>) => onChange({ rows: rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_8rem_5rem_5rem_auto] gap-2 text-xs font-medium text-base-content/60">
            <span>INCI</span><span>CAS</span><span>Min %</span><span>Max %</span><span className="w-[4.5rem]" />
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_8rem_5rem_5rem_auto] items-center gap-2">
              <input className="input input-sm" value={row.inci} onChange={(e) => set(i, { inci: e.target.value })} />
              <input className="input input-sm font-mono" value={row.cas ?? ""} onChange={(e) => set(i, { cas: e.target.value || null })} />
              <input type="number" step="any" className="input input-sm" value={row.percentMin ?? ""} onChange={(e) => set(i, { percentMin: numberOrNull(e.target.value) })} />
              <input type="number" step="any" className="input input-sm" value={row.percentMax ?? ""} onChange={(e) => set(i, { percentMax: numberOrNull(e.target.value) })} />
              <RowControls index={i} length={rows.length} onMove={(to) => onChange({ rows: move(rows, i, to) })} onRemove={() => onChange({ rows: rows.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => onChange({ rows: [...rows, { inci: "", cas: null, percentMin: null, percentMax: null }] })}><TbPlus /> Add component</button>
        </div>
      )
    }

    case "billOfMaterials":
      return <p className="text-sm text-base-content/60">The bill of materials is linked to the active MBPR and is edited there.</p>
  }
}

export default ContentEditor
