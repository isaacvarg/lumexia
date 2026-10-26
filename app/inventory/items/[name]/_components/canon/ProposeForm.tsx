'use client'
import { useState } from "react"
import { TbPlus, TbX } from "react-icons/tb"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import { canonSourceTypes } from "@/configs/staticRecords/canonSourceTypes"
import type { CanonLookups } from "@/actions/canon/lookups"
import type { CanonEntry, ItemCanon } from "@/lib/canon/queries"
import { getShapeKey, parseContent } from "@/lib/canon/shapes"
import ContentEditor, { emptyContent } from "./ContentEditor"
import DiffView from "./DiffView"
import { useDocumentFacts } from "./DocumentFacts"
import ItemFactList from "@/components/DocumentExtractions/ItemFactList"
import type { ItemFact } from "@/lib/documentExtractions/queries"

type SourceRow = { sourceTypeId: string; fileId: string; url: string; note: string; sourceDate: string }

type Props = {
  entry: CanonEntry
  lookups: CanonLookups
  files: ItemCanon["files"]
  onDone: () => void
}

const ProposeForm = ({ entry, lookups, files, onDone }: Props) => {
  const { toast } = useToast()
  const { dataType, artifact, subject } = entry
  const shapeKey = getShapeKey(dataType.shapeId)
  const current = artifact?.currentVersion?.content ?? null
  const tagOptions = (dataType.shapeConfig as { options?: string[] } | null)?.options ?? []

  // edit a copy of the current value; JSON round-trip drops shared references
  const [content, setContent] = useState<any>(() => (current ? JSON.parse(JSON.stringify(current)) : emptyContent(shapeKey)))
  const [reason, setReason] = useState("")
  const [sources, setSources] = useState<SourceRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  // extracted facts from the item's documents that back this value, cited as evidence
  const documentFacts = useDocumentFacts(entry)
  const [cited, setCited] = useState<Map<string, ItemFact>>(new Map())
  const toggleCited = (fact: ItemFact) =>
    setCited((prev) => {
      const next = new Map(prev)
      if (next.has(fact.id)) next.delete(fact.id)
      else next.set(fact.id, fact)
      return next
    })

  // one source per extraction: its document, the cited facts, and their labels as the note
  const citedSources = () => {
    const byExtraction = new Map<string, ItemFact[]>()
    for (const f of Array.from(cited.values())) byExtraction.set(f.extraction.id, [...(byExtraction.get(f.extraction.id) ?? []), f])
    return Array.from(byExtraction.entries()).map(([extractionId, facts]) => ({
      sourceTypeId: canonSourceTypes.supplierDocument,
      fileId: facts[0].documents[0]?.fileId ?? null,
      url: null,
      note: `Extracted: ${Array.from(new Set(facts.map((f) => f.label))).join(", ")}`,
      sourceDate: null,
      extractionId,
      factIds: facts.map((f) => f.id),
    }))
  }

  // lumexiaRecord is only for linked-source acceptance
  const sourceTypes = lookups.sourceTypes.filter((s) => s.id !== canonSourceTypes.lumexiaRecord)

  const addSource = () =>
    setSources((rows) => [...rows, { sourceTypeId: sourceTypes[0]?.id ?? "", fileId: "", url: "", note: "", sourceDate: "" }])
  const setSource = (i: number, patch: Partial<SourceRow>) =>
    setSources((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  let valid = true
  try { parseContent(shapeKey, content) } catch { valid = false }

  const submit = async () => {
    if (!reason.trim()) {
      toast("Missing reason", "Say why this change is needed.", "error")
      return
    }
    if (dataType.requiresEvidence && sources.length === 0 && cited.size === 0) {
      toast("Missing evidence", `${dataType.name} needs evidence for every change.`, "error")
      return
    }

    setSubmitting(true)
    try {
      const cr = await canonActions.changeRequests.proposeEdit({
        dataTypeId: dataType.id,
        subject,
        proposedContent: content,
        reason,
        sources: [
          ...sources.map((s) => ({
            sourceTypeId: s.sourceTypeId,
            fileId: s.fileId || null,
            url: s.url || null,
            note: s.note || null,
            sourceDate: s.sourceDate ? new Date(s.sourceDate) : null,
          })),
          ...citedSources(),
        ],
      })
      if (cr.version) toast("Saved", `${dataType.name} is now v${cr.version.versionNumber}.`, "success")
      else toast("Sent for review", `Your change to ${dataType.name} is waiting for a reviewer.`, "success")
      onDone()
    } catch (e) {
      toast("Could not propose", (e as Error).message, "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{current ? "Propose a change" : "Add a value"}: {dataType.name}</h2>
        {dataType.description && <p className="text-base-content/60">{dataType.description}</p>}
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Value</h3>
        <ContentEditor shapeKey={shapeKey} value={content} onChange={setContent} tagOptions={tagOptions} />
      </section>

      {current && valid && (
        <section className="flex flex-col gap-2">
          <h3 className="font-semibold">Changes from v{artifact?.currentVersion?.versionNumber}</h3>
          <DiffView shapeKey={shapeKey} before={current} after={content} hideUnchanged />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Reason</h3>
        <textarea className="textarea w-full" rows={2} placeholder="Why is this changing?" value={reason} onChange={(e) => setReason(e.target.value)} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Evidence {dataType.requiresEvidence && <span className="badge badge-sm badge-warning ml-1">required</span>}
          </h3>
          <button type="button" onClick={addSource} className="btn btn-ghost btn-sm"><TbPlus /> Add source</button>
        </div>
        {documentFacts.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-base-content/70">
              Cite what the item&apos;s documents say{cited.size > 0 && ` (${cited.size} selected)`}:
            </p>
            <div className="max-h-72 overflow-y-auto">
              <ItemFactList facts={documentFacts} selected={new Set(cited.keys())} onToggle={toggleCited} />
            </div>
          </div>
        )}
        {sources.length === 0 && cited.size === 0 && <p className="text-sm italic text-base-content/50">No sources added.</p>}
        {sources.map((s, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-base-300 p-3 md:grid-cols-2">
            <select className="select select-sm w-full" value={s.sourceTypeId} onChange={(e) => setSource(i, { sourceTypeId: e.target.value })}>
              {sourceTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" className="input input-sm flex-1" value={s.sourceDate} onChange={(e) => setSource(i, { sourceDate: e.target.value })} aria-label="Source date" />
              <button type="button" className="btn btn-ghost btn-sm btn-square text-error" onClick={() => setSources((rows) => rows.filter((_, j) => j !== i))} aria-label="Remove source"><TbX /></button>
            </div>
            <select className="select select-sm w-full md:col-span-2" value={s.fileId} onChange={(e) => setSource(i, { fileId: e.target.value })}>
              <option value="">No file — or pick one attached to this item…</option>
              {files.map((f) => <option key={f.fileId} value={f.fileId}>{f.file.name} ({f.fileType.name})</option>)}
            </select>
            <input className="input input-sm w-full" placeholder="URL (optional)" value={s.url} onChange={(e) => setSource(i, { url: e.target.value })} />
            <input className="input input-sm w-full" placeholder="Note, e.g. SDS section 3" value={s.note} onChange={(e) => setSource(i, { note: e.target.value })} />
          </div>
        ))}
      </section>

      <div className="flex justify-end gap-2">
        <button onClick={submit} disabled={submitting || !valid} className="btn btn-success">
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  )
}

export default ProposeForm
