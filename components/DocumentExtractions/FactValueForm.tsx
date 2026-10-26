'use client'
import { claimStatuses, type ColumnSchema, type FactKind, type ValueSchema } from "@/lib/documentExtractions/types"

// Inputs for one fact's value, shaped by its catalog key, for a person correcting what the agent read.
// The value it produces has the shape the server validates (see lib/documentExtractions/validate.ts).

export type FactShape = { kind: FactKind; valueSchema: ValueSchema; unitFamily: string | null }

type NumberParts = { value: string; max: string; qualifier: string }

const numberParts = (v: unknown): NumberParts => {
  if (typeof v === "number") return { value: String(v), max: "", qualifier: "" }
  const o = (v ?? {}) as { value?: number; min?: number; max?: number; qualifier?: string }
  const lo = o.value ?? o.min
  return { value: lo === undefined ? "" : String(lo), max: o.value === undefined && o.max !== undefined && o.max !== o.min ? String(o.max) : "", qualifier: o.qualifier ?? "" }
}

const numberValue = (p: NumberParts): unknown => {
  const lo = p.value.trim() === "" ? undefined : Number(p.value)
  const hi = p.max.trim() === "" ? undefined : Number(p.max)
  const qualifier = p.qualifier.trim() || undefined
  if (hi === undefined) return qualifier ? { value: lo, qualifier } : lo
  return { min: lo, max: hi, ...(qualifier && { qualifier }) }
}

const NumberInput = ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => {
  const p = numberParts(value)
  const set = (patch: Partial<NumberParts>) => onChange(numberValue({ ...p, ...patch }))
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="number" step="any" className="input input-sm w-28" value={p.value} onChange={(e) => set({ value: e.target.value })} aria-label="Value" />
      <span className="text-sm text-base-content/50">to</span>
      <input type="number" step="any" className="input input-sm w-28" value={p.max} onChange={(e) => set({ max: e.target.value })} placeholder="optional" aria-label="Upper bound" />
      <input className="input input-sm w-40" value={p.qualifier} onChange={(e) => set({ qualifier: e.target.value })} placeholder="e.g. closed cup" aria-label="Qualifier" />
    </div>
  )
}

const ColumnInput = ({ column, value, onChange }: { column: ColumnSchema; value: unknown; onChange: (v: unknown) => void }) => {
  if (column.type === "enum") {
    return (
      <select className="select select-sm w-full" value={String(value ?? "")} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">—</option>
        {column.options?.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  if (column.type === "list") {
    return (
      <input
        className="input input-sm w-full"
        value={Array.isArray(value) ? value.join(", ") : ""}
        onChange={(e) => {
          const items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
          onChange(items.length ? items : undefined)
        }}
        placeholder="comma separated"
      />
    )
  }
  if (column.type === "number") {
    return (
      <input
        type="number"
        step="any"
        className="input input-sm w-full"
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    )
  }
  if (column.type === "boolean") {
    return (
      <select className="select select-sm w-full" value={value === undefined ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value === "true")}>
        <option value="">—</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    )
  }
  return (
    <input
      type={column.type === "date" ? "date" : "text"}
      className="input input-sm w-full"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    />
  )
}

const FactValueForm = ({ shape, value, onChange }: { shape: FactShape; value: unknown; onChange: (v: unknown) => void }) => {
  const schema = shape.valueSchema ?? {}
  switch (shape.kind) {
    case "scalar":
      if (schema.type === "number") return <NumberInput value={value} onChange={onChange} />
      return <ColumnInput column={{ name: "value", type: schema.type ?? "text" }} value={value} onChange={onChange} />
    case "enum":
      return <ColumnInput column={{ name: "value", type: "enum", options: schema.options }} value={value} onChange={onChange} />
    case "claim": {
      const status = (value as { status?: string } | null)?.status ?? ""
      return (
        <select className="select select-sm w-48" value={status} onChange={(e) => onChange({ status: e.target.value })}>
          {claimStatuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      )
    }
    case "section": {
      const v = (value ?? { present: true, empty: false }) as { present: boolean; empty: boolean }
      return (
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox checkbox-sm" checked={v.present} onChange={(e) => onChange({ present: e.target.checked, empty: e.target.checked && v.empty })} />
            Section present
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox checkbox-sm" checked={v.empty} disabled={!v.present} onChange={(e) => onChange({ ...v, empty: e.target.checked })} />
            Present but empty
          </label>
        </div>
      )
    }
    case "row": {
      const row = (value ?? {}) as Record<string, unknown>
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(schema.columns ?? []).map((column) => (
            <label key={column.name} className="flex flex-col gap-1">
              <span className="text-xs text-base-content/60">
                {column.name.replace(/_/g, " ")}
                {column.required && " *"}
              </span>
              <ColumnInput
                column={column}
                value={row[column.name]}
                onChange={(cell) => {
                  const next = { ...row }
                  if (cell === undefined) delete next[column.name]
                  else next[column.name] = cell
                  onChange(next)
                }}
              />
            </label>
          ))}
        </div>
      )
    }
  }
}

export default FactValueForm
