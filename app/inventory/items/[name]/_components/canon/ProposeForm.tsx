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
    if (dataType.requiresEvidence && sources.length === 0) {
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
        sources: sources.map((s) => ({
          sourceTypeId: s.sourceTypeId,
          fileId: s.fileId || null,
          url: s.url || null,
          note: s.note || null,
          sourceDate: s.sourceDate ? new Date(s.sourceDate) : null,
        })),
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
        {sources.length === 0 && <p className="text-sm italic text-base-content/50">No sources added.</p>}
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
