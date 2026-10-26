'use client'
import { useCallback, useEffect, useMemo, useState } from "react"
import { TbAlertTriangle, TbArrowBackUp, TbCheck, TbChevronDown, TbChevronRight, TbPencil, TbRefresh, TbX, TbZoomQuestion } from "react-icons/tb"
import {
  clearDocumentExtractionFailure,
  DocumentExtractionView,
  getDocumentExtractionView,
  getExtractionFullText,
  overrideExtractedFact,
  revertExtractedFactOverride,
  unverifyExtractedFact,
  verifyExtractedFact,
} from "@/actions/documentExtractions"
import FactValueForm, { FactShape } from "./FactValueForm"
import { MethodBadge, pageHref, pageLabel, reviewStateLabel } from "./presentation"

// What the extraction agent read from a document's file, fact by fact, where people verify facts and
// correct the agent. Used in the Files tab's document preview and the extraction review queue.

type View = Extract<DocumentExtractionView, { exists: true }>
type Fact = View["extraction"]["facts"][number]

const day = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString() : "")

const OverrideForm = ({ fact, shape, onDone }: { fact: Fact; shape: FactShape; onDone: (saved: boolean) => void }) => {
  const [value, setValue] = useState<unknown>(fact.value)
  const [unit, setUnit] = useState(fact.unit ?? "")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const hasUnit = !!shape.unitFamily || (shape.kind === "scalar" && shape.valueSchema.type === "number")

  const save = async () => {
    setSaving(true)
    setError(null)
    const result = await overrideExtractedFact(fact.id, { value, unit: hasUnit ? unit : undefined, reason })
    setSaving(false)
    if (result.ok) onDone(true)
    else setError(result.error)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/50 p-3">
      <FactValueForm shape={shape} value={value} onChange={setValue} />
      {hasUnit && (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-base-content/60">Unit</span>
          <input className="input input-sm w-32" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </label>
      )}
      <input className="input input-sm w-full" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why it's wrong, e.g. the agent read the °F figure as °C" />
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDone(false)}>Cancel</button>
        <button type="button" className="btn btn-primary btn-sm" disabled={saving || !reason.trim()} onClick={save}>
          {saving && <span className="loading loading-spinner loading-xs" />} Save correction
        </button>
      </div>
    </div>
  )
}

const FactRow = ({ fact, shape, fileUrl, onChanged }: { fact: Fact; shape?: FactShape; fileUrl?: string; onChanged: () => void }) => {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overridden = fact.state === "overridden"
  const human = fact.method === "human"
  const page = pageLabel(fact.page)

  const act = async (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setBusy(true)
    setError(null)
    const result = await fn()
    setBusy(false)
    if (result.ok) onChanged()
    else setError(result.error)
  }

  return (
    <li className={`flex flex-col gap-2 px-3 py-2 ${overridden ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {"component" in fact && fact.component && (
              <span className="font-medium">{fact.component.name ?? fact.component.cas}{fact.component.name && fact.component.cas && <span className="font-normal text-base-content/50"> · {fact.component.cas}</span>}:</span>
            )}
            <span className={overridden ? "line-through" : ""}>{shape?.kind === "claim" ? fact.printed?.replace(/_/g, " ") : fact.printed}</span>
            <MethodBadge method={fact.method} />
            {fact.confidence !== "high" && <span className="badge badge-ghost badge-xs">{fact.confidence} confidence</span>}
            {fact.needsHumanCheck && !fact.verified && !overridden && (
              <span className="badge badge-warning badge-soft badge-xs gap-1"><TbZoomQuestion className="size-3" />check</span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-base-content/60">
            {page && (fileUrl ? <a href={pageHref(fileUrl, fact.page.index)} target="_blank" rel="noopener noreferrer" className="link mr-1">{page}</a> : <span className="mr-1">{page}</span>)}
            <q className="italic">{fact.quote}</q>
          </div>
          {fact.verified && (
            <div className="mt-0.5 text-xs text-success">{human ? "Entered" : "Verified"} by {fact.verified.by ?? "someone"} {day(fact.verified.at)}</div>
          )}
          {error && <p role="alert" className="mt-1 text-xs text-error">{error}</p>}
        </div>

        {!overridden && (
          <div className="flex shrink-0 items-center gap-1">
            {!human && !fact.verified && (
              <button type="button" className="btn btn-ghost btn-xs text-success" disabled={busy} onClick={() => act(() => verifyExtractedFact(fact.id))} title="It matches the document">
                <TbCheck /> Verify
              </button>
            )}
            {!human && fact.verified && (
              <button type="button" className="btn btn-ghost btn-xs" disabled={busy} onClick={() => act(() => unverifyExtractedFact(fact.id))} title="Undo your check">
                <TbX /> Unverify
              </button>
            )}
            {shape && !editing && (
              <button type="button" className="btn btn-ghost btn-xs" disabled={busy} onClick={() => setEditing(true)} title="Correct what the agent read">
                <TbPencil /> Correct
              </button>
            )}
            {human && (
              <button type="button" className="btn btn-ghost btn-xs" disabled={busy} onClick={() => act(() => revertExtractedFactOverride(fact.id))} title="Remove your correction and restore the agent's reading">
                <TbArrowBackUp /> Revert
              </button>
            )}
          </div>
        )}
      </div>
      {editing && shape && <OverrideForm fact={fact} shape={shape} onDone={(saved) => { setEditing(false); if (saved) onChanged() }} />}
    </li>
  )
}

const FullText = ({ extractionId }: { extractionId: string }) => {
  const [text, setText] = useState<string | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const toggle = async () => {
    setOpen((v) => !v)
    if (text === undefined) setText(await getExtractionFullText(extractionId))
  }
  return (
    <div>
      <button type="button" className="btn btn-ghost btn-xs" onClick={toggle} aria-expanded={open}>
        {open ? <TbChevronDown /> : <TbChevronRight />} Full text
      </button>
      {open && (
        <pre className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-base-200 p-3 text-xs">
          {text === undefined ? "Loading…" : text ?? "The agent didn't store the document's text."}
        </pre>
      )}
    </div>
  )
}

const History = ({ history }: { history: NonNullable<View["history"]> }) => {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" className="btn btn-ghost btn-xs" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? <TbChevronDown /> : <TbChevronRight />} History ({history.length})
      </button>
      {open && (
        <ol className="mt-1 flex flex-col gap-1 text-xs">
          {[...history].reverse().map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-20 shrink-0 text-base-content/50">{day(e.at)}</span>
              <span>
                <span className="font-medium">{e.type.replace(/_/g, " ")}</span> by {e.by ?? "someone"}
                {e.reason && <span className="text-base-content/60"> — {e.reason}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// onChanged lets a page refresh its own counts after a person verifies or corrects something.
const ExtractionPanel = ({ documentId, fileUrl, onChanged }: { documentId: string; fileUrl?: string; onChanged?: () => void }) => {
  const [view, setView] = useState<DocumentExtractionView | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setView(await getDocumentExtractionView(documentId))
    } catch {
      setError("Couldn't load the extraction.")
    }
  }, [documentId])
  const reload = useCallback(() => {
    load()
    onChanged?.()
  }, [load, onChanged])

  useEffect(() => {
    setView(null)
    load()
  }, [load])

  // facts grouped by key, in catalog order (they come sorted)
  const groups = useMemo(() => {
    if (!view || !("exists" in view) || !view.exists) return []
    const map = new Map<string, { label: string; facts: Fact[] }>()
    for (const f of view.extraction.facts) {
      const g = map.get(f.key) ?? { label: f.label, facts: [] }
      g.facts.push(f)
      map.set(f.key, g)
    }
    return Array.from(map.entries())
  }, [view])

  if (error) return <p className="text-sm text-error">{error}</p>
  if (!view) return <p className="text-sm text-base-content/60"><span className="loading loading-spinner loading-xs" /> Loading extraction…</p>
  if ("error" in view) return <p className="text-sm text-base-content/60">{view.error}</p>
  if (!view.exists) {
    return (
      <p className="text-sm text-base-content/60">
        The extraction agent hasn&apos;t read this file yet{view.previousExtractions > 0 && ` (${view.previousExtractions} earlier extraction${view.previousExtractions === 1 ? "" : "s"} replaced)`}.
      </p>
    )
  }

  const { extraction } = view
  if (extraction.status === "failed") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-error/10 p-3 text-sm">
        <TbAlertTriangle className="size-5 text-error" />
        <span className="flex-1">The extraction agent couldn&apos;t read this file: {extraction.failureReason}</span>
        <button
          type="button"
          className="btn btn-sm"
          onClick={async () => {
            const result = await clearDocumentExtractionFailure(extraction.id)
            if (result.ok) reload()
            else setError(result.error)
          }}
          title="The agent will try reading it again"
        >
          <TbRefresh /> Retry
        </button>
      </div>
    )
  }

  const shared = view.documents.filter((d) => d.documentId !== documentId)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{reviewStateLabel[extraction.reviewState] ?? extraction.reviewState}</span>
        {extraction.needsHumanCheck > 0 && <span className="badge badge-warning badge-soft badge-sm">{extraction.needsHumanCheck} to check</span>}
        {extraction.methods.map((m) => <MethodBadge key={m} method={m} />)}
        <span className="text-base-content/50">
          · {extraction.extractor.name}{extraction.extractor.version && ` ${extraction.extractor.version}`}{extraction.extractor.model && ` (${extraction.extractor.model})`} · {day(extraction.createdAt)}
        </span>
      </div>

      {shared.length > 0 && (
        <p className="text-xs text-base-content/60">Same file as {shared.map((d) => `${d.item.name} (${d.type})`).join(", ")}; checks here apply there too.</p>
      )}
      {extraction.completeness.missingRequired.length > 0 && (
        <p className="text-xs text-warning">Not captured: {extraction.completeness.missingRequired.join(", ")}</p>
      )}
      {extraction.notes && <p className="whitespace-pre-wrap rounded-lg bg-base-200 p-2 text-xs">{extraction.notes}</p>}
      {"conflicts" in extraction && Array.isArray(extraction.conflicts) && extraction.conflicts.length > 0 && (
        <div className="rounded-lg bg-warning/10 p-2 text-xs">
          <p className="font-medium">A re-read changed facts people had verified:</p>
          <ul className="list-inside list-disc">
            {(extraction.conflicts as { key: string; reason: string; previousValue: unknown; newValue?: unknown }[]).map((c, i) => (
              <li key={i}>
                {c.key}: {JSON.stringify(c.previousValue)} {c.reason === "changed" ? `→ ${JSON.stringify(c.newValue)}` : "no longer found"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col divide-y divide-base-300 rounded-lg border border-base-300">
        {groups.map(([key, group]) => (
          <section key={key}>
            <h4 className="bg-base-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">{group.label}</h4>
            <ul className="divide-y divide-base-300/60">
              {group.facts.map((f) => <FactRow key={f.id} fact={f} shape={view.definitions[key]} fileUrl={fileUrl} onChanged={reload} />)}
            </ul>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FullText extractionId={extraction.id} />
        {view.history && <History history={view.history} />}
      </div>
    </div>
  )
}

export default ExtractionPanel
