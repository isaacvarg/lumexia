'use client'
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TbAlertTriangle, TbArchive, TbCheck, TbGitMerge, TbPencil, TbSearch, TbShieldExclamation } from "react-icons/tb"
import SectionTitle from "@/components/Text/SectionTitle"
import {
  approveFactCatalogEntry,
  deprecateFactCatalogEntry,
  FactCatalogEntry,
  mergeFactCatalogEntry,
  updateFactCatalogEntry,
} from "@/actions/documentExtractions"
import { FileTypeOption } from "./types"

// The keys document extractions store facts under. Seeded keys arrive approved; keys the extraction agent
// adds arrive as proposed and can be used at once, so people review them here: approve, tidy up, merge a
// duplicate into the key it repeats, or deprecate.

type Status = "proposed" | "approved" | "deprecated"
type Result = { ok: true } | { ok: false; error: string }

const kindLabel: Record<string, string> = { scalar: "Value", enum: "Choice", claim: "Claim", row: "Table rows", section: "Section" }

const shapeSummary = (d: FactCatalogEntry) => {
  const schema = (d.valueSchema ?? {}) as { type?: string; options?: string[]; columns?: { name: string }[] }
  if (d.kind === "scalar") return `${schema.type ?? "text"}${d.unitFamily ? ` (${d.unitFamily})` : ""}`
  if (d.kind === "enum") return schema.options?.join(" · ")
  if (d.kind === "row") return schema.columns?.map((c) => c.name).join(", ")
  if (d.kind === "claim") return "stated · negated · not stated"
  return "present · empty"
}

const EditForm = ({ entry, fileTypes, onDone }: { entry: FactCatalogEntry; fileTypes: FileTypeOption[]; onDone: (saved: boolean) => void }) => {
  const [label, setLabel] = useState(entry.label)
  const [description, setDescription] = useState(entry.description ?? "")
  const [safetyRelevant, setSafetyRelevant] = useState(entry.safetyRelevant)
  const [displayOrder, setDisplayOrder] = useState(entry.displayOrder)
  const [types, setTypes] = useState(new Map(entry.fileTypes.map((t) => [t.fileType.id, t.required])))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleType = (id: string, applies: boolean) =>
    setTypes((prev) => {
      const next = new Map(prev)
      if (applies) next.set(id, false)
      else next.delete(id)
      return next
    })

  const save = async () => {
    setSaving(true)
    setError(null)
    const result = await updateFactCatalogEntry(entry.id, {
      label,
      description,
      safetyRelevant,
      displayOrder,
      fileTypes: Array.from(types.entries()).map(([fileTypeId, required]) => ({ fileTypeId, required })),
    })
    setSaving(false)
    if (result.ok) onDone(true)
    else setError(result.error)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Label</span>
          <input className="input input-sm w-full" value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Order</span>
          <input type="number" className="input input-sm w-full" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">What it means and how to read it</span>
        <textarea className="textarea textarea-sm w-full" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="checkbox checkbox-sm" checked={safetyRelevant} onChange={(e) => setSafetyRelevant(e.target.checked)} />
        Safety-relevant: facts read from page images or OCR wait for a person&apos;s check
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Document types</span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {fileTypes.map((t) => (
            <div key={t.id} className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="checkbox checkbox-sm" checked={types.has(t.id)} onChange={(e) => toggleType(t.id, e.target.checked)} />
                {t.name}
              </label>
              {types.has(t.id) && (
                <label className="flex items-center gap-1 text-base-content/70">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={types.get(t.id) ?? false}
                    onChange={(e) => setTypes((prev) => new Map(prev).set(t.id, e.target.checked))}
                  />
                  required
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDone(false)}>Cancel</button>
        <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={save}>
          {saving && <span className="loading loading-spinner loading-xs" />} Save
        </button>
      </div>
    </div>
  )
}

const MergeForm = ({ entry, catalog, onDone }: { entry: FactCatalogEntry; catalog: FactCatalogEntry[]; onDone: (saved: boolean) => void }) => {
  const targets = catalog.filter((d) => d.id !== entry.id && d.kind === entry.kind && d.status !== "deprecated" && !d.mergedInto)
  const [intoId, setIntoId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const target = targets.find((t) => t.id === intoId)

  const merge = async () => {
    setSaving(true)
    setError(null)
    const result = await mergeFactCatalogEntry(entry.id, intoId)
    setSaving(false)
    if (result.ok) onDone(true)
    else setError(result.error)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/50 p-4">
      <p className="text-sm">
        Move {entry.facts} fact{entry.facts === 1 ? "" : "s"} from <code>{entry.key}</code> to another {kindLabel[entry.kind]?.toLowerCase()} key.
        <code> {entry.key}</code> is then deprecated, and agents writing it land on the new key.
      </p>
      <select className="select select-sm w-full" value={intoId} onChange={(e) => setIntoId(e.target.value)}>
        <option value="">Merge into…</option>
        {targets.map((t) => <option key={t.id} value={t.id}>{t.label} ({t.key})</option>)}
      </select>
      {target && <p className="text-xs text-base-content/60">{shapeSummary(target)}</p>}
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDone(false)}>Cancel</button>
        <button type="button" className="btn btn-primary btn-sm" disabled={saving || !intoId} onClick={merge}>
          {saving && <span className="loading loading-spinner loading-xs" />} Merge
        </button>
      </div>
    </div>
  )
}

const EntryRow = ({ entry, catalog, fileTypes }: { entry: FactCatalogEntry; catalog: FactCatalogEntry[]; fileTypes: FileTypeOption[] }) => {
  const router = useRouter()
  const [mode, setMode] = useState<null | "edit" | "merge">(null)
  const [error, setError] = useState<string | null>(null)
  const done = (saved: boolean) => {
    setMode(null)
    if (saved) router.refresh()
  }
  const act = async (fn: () => Promise<Result>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setError(null)
    const result = await fn()
    if (result.ok) router.refresh()
    else setError(result.error)
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{entry.label}</span>
            <code className="text-xs text-base-content/60">{entry.key}</code>
            <span className="badge badge-ghost badge-xs">{kindLabel[entry.kind] ?? entry.kind}</span>
            {entry.safetyRelevant && <TbShieldExclamation className="size-4 text-warning" title="Safety-relevant" />}
            {entry.status === "proposed" && <span className="badge badge-warning badge-soft badge-xs">proposed by agent</span>}
            {entry.mergedInto && <span className="badge badge-ghost badge-xs">merged into {entry.mergedInto.key}</span>}
          </div>
          {entry.description && <p className="text-sm text-base-content/70">{entry.description}</p>}
          <p className="truncate text-xs text-base-content/50">{shapeSummary(entry)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {entry.fileTypes.map((t) => (
              <span key={t.fileType.id} className={`badge badge-xs ${t.required ? "badge-neutral" : "badge-ghost"}`} title={t.required ? "Required" : "Applies"}>
                {t.fileType.abbreviaton ?? t.fileType.name}{t.required && " *"}
              </span>
            ))}
            <span className="text-xs text-base-content/50">{entry.facts} fact{entry.facts === 1 ? "" : "s"}</span>
          </div>
          {error && <p role="alert" className="mt-1 flex items-center gap-1 text-sm text-error"><TbAlertTriangle /> {error}</p>}
        </div>
        {entry.status !== "deprecated" && mode === null && (
          <div className="flex shrink-0 flex-wrap items-center gap-1">
            {entry.status === "proposed" && (
              <button type="button" className="btn btn-ghost btn-xs text-success" onClick={() => act(() => approveFactCatalogEntry(entry.id))}><TbCheck /> Approve</button>
            )}
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setMode("edit")}><TbPencil /> Edit</button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setMode("merge")}><TbGitMerge /> Merge</button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => act(() => deprecateFactCatalogEntry(entry.id), `Deprecate ${entry.key}? Agents can no longer store facts under it; existing facts stay.`)}
            >
              <TbArchive /> Deprecate
            </button>
          </div>
        )}
      </div>
      {mode === "edit" && <EditForm entry={entry} fileTypes={fileTypes} onDone={done} />}
      {mode === "merge" && <MergeForm entry={entry} catalog={catalog} onDone={done} />}
    </li>
  )
}

const FactCatalog = ({ catalog, fileTypes }: { catalog: FactCatalogEntry[]; fileTypes: FileTypeOption[] }) => {
  const counts = useMemo(
    () => ({
      proposed: catalog.filter((d) => d.status === "proposed").length,
      approved: catalog.filter((d) => d.status === "approved").length,
      deprecated: catalog.filter((d) => d.status === "deprecated").length,
    }),
    [catalog],
  )
  const [status, setStatus] = useState<Status>(counts.proposed > 0 ? "proposed" : "approved")
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const shown = catalog.filter((d) => d.status === status && (!q || d.key.includes(q) || d.label.toLowerCase().includes(q)))

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Fact Catalog</SectionTitle>
      <p className="max-w-3xl text-base-content/70">
        What document extractions record from supplier documents. Keys the extraction agent adds can be used right away
        and wait here as proposed. Required keys mark an extraction of that document type incomplete when missing.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="tabs tabs-box">
          {(["proposed", "approved", "deprecated"] as Status[]).map((s) => (
            <button key={s} role="tab" type="button" aria-selected={status === s} className={`tab gap-2 capitalize ${status === s ? "tab-active" : ""}`} onClick={() => setStatus(s)}>
              {s} <span className={`badge badge-sm ${s === "proposed" && counts.proposed > 0 ? "badge-warning" : ""}`}>{counts[s]}</span>
            </button>
          ))}
        </div>
        <label className="input input-sm w-64">
          <TbSearch className="opacity-50" />
          <input type="search" placeholder="Search keys" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        {shown.length === 0 ? (
          <p className="p-6 text-center text-sm text-base-content/60">{status === "proposed" ? "No keys wait for review." : "No keys here."}</p>
        ) : (
          <ul className="divide-y divide-base-300">
            {shown.map((d) => <EntryRow key={d.id} entry={d} catalog={catalog} fileTypes={fileTypes} />)}
          </ul>
        )}
      </section>
    </div>
  )
}

export default FactCatalog
