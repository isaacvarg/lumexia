'use client'
import { useCallback, useEffect, useMemo, useState } from "react"
import { TbCheck, TbClock, TbFile, TbLink, TbX } from "react-icons/tb"
import useToast from "@/hooks/useToast"
import { useAppSelection } from "@/store/appSlice"
import { canonActions } from "@/actions/canon"
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses"
import { canonEventTypes } from "@/configs/staticRecords/canonEventTypes"
import type { CanonEntry } from "@/lib/canon/queries"
import { getShapeKey } from "@/lib/canon/shapes"
import ContentView from "./ContentView"
import DiffView from "./DiffView"
import StatusBadge from "./StatusBadge"

type History = Awaited<ReturnType<typeof canonActions.artifacts.getHistory>>
type Version = History["versions"][number]
type ChangeRequest = History["changeRequests"][number]

// events that a version entry already explains
const coveredByVersions = new Set<string>([
  canonEventTypes.changeRequestOpened,
  canonEventTypes.changeRequestApproved,
  canonEventTypes.versionCreated,
])

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })

const Sources = ({ sources }: { sources: ChangeRequest["sources"] }) => {
  if (sources.length === 0) return null
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {sources.map((s) => (
        <li key={s.id} className="flex flex-wrap items-center gap-2">
          <span className="badge badge-sm badge-soft">{s.sourceType.name}</span>
          {s.file && <span className="inline-flex items-center gap-1"><TbFile className="size-4" />{s.file.name}</span>}
          {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="link link-primary inline-flex items-center gap-1"><TbLink className="size-4" />link</a>}
          {s.note && <span className="text-base-content/70">{s.note}</span>}
          {s.sourceDate && <span className="text-base-content/50">dated {new Date(s.sourceDate).toLocaleDateString()}</span>}
        </li>
      ))}
    </ul>
  )
}

const PendingRequest = ({
  cr, history, canReview, onChanged,
}: { cr: ChangeRequest; history: History; canReview: boolean; onChanged: () => void }) => {
  const { toast } = useToast()
  const { user } = useAppSelection()
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const shapeKey = getShapeKey(history.dataType.shapeId)
  const current = history.versions[0]?.content ?? null
  const isRequester = user?.id === cr.requestedById
  const alreadyApproved = cr.reviews.some((r) => r.reviewerId === user?.id && r.approved)

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true)
    try {
      await fn()
      toast("Done", done, "success")
      onChanged()
    } catch (e) {
      toast("Could not complete", (e as Error).message, "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-warning/50 bg-warning/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">
          CR-{cr.referenceCode} · {cr.kind.name}
          <span className="ml-2 font-normal text-base-content/60">by {cr.requestedBy.name} · {formatDate(cr.createdAt)}</span>
        </div>
        <span className="badge badge-warning badge-soft">
          {cr.reviews.filter((r) => r.approved).length}/{history.dataType.requiredApprovals} approvals
        </span>
      </div>
      <p className="whitespace-pre-wrap">{cr.reason}</p>
      {cr.proposedContent !== null && (
        <DiffView shapeKey={shapeKey} before={current} after={cr.proposedContent} hideUnchanged={current !== null} />
      )}
      <Sources sources={cr.sources} />
      {cr.reviews.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {cr.reviews.map((r) => (
            <span key={r.id} className={`badge badge-soft ${r.approved ? "badge-success" : "badge-error"}`}>
              {r.approved ? <TbCheck /> : <TbX />} {r.reviewer.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        {canReview && !alreadyApproved && (
          <>
            <input className="input input-sm min-w-48 flex-1" placeholder="Comment (required to reject)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button
              disabled={busy}
              className="btn btn-sm btn-success"
              onClick={() => run(() => canonActions.changeRequests.review({ changeRequestId: cr.id, approved: true, comment: comment || null }), "Your approval was recorded.")}
            >
              <TbCheck /> Approve
            </button>
            <button
              disabled={busy}
              className="btn btn-sm btn-error btn-soft"
              onClick={() => run(() => canonActions.changeRequests.review({ changeRequestId: cr.id, approved: false, comment }), "The change was rejected.")}
            >
              <TbX /> Reject
            </button>
          </>
        )}
        {isRequester && (
          <button
            disabled={busy}
            className="btn btn-sm btn-ghost ml-auto"
            onClick={() => run(() => canonActions.changeRequests.withdraw(cr.id), "Your change request was withdrawn.")}
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  )
}

const VersionEntry = ({ version, previous, shapeKey }: { version: Version; previous: Version | undefined; shapeKey: ReturnType<typeof getShapeKey> }) => {
  const cr = version.changeRequest
  const approvers = cr.reviews.filter((r) => r.approved).map((r) => r.reviewer.name)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">v{version.versionNumber}</span>
        <span className="badge badge-sm badge-soft">{cr.kind.name}</span>
        <span className="text-sm text-base-content/60">{formatDate(version.createdAt)}</span>
      </div>
      <p className="text-sm text-base-content/70">
        Proposed by {cr.requestedBy.name}
        {approvers.length > 0 && <> · approved by {approvers.join(", ")}</>}
        {version.reverifyAt && <> · re-verify by {new Date(version.reverifyAt).toLocaleDateString()}</>}
      </p>
      <p className="whitespace-pre-wrap">{cr.reason}</p>
      <DiffView shapeKey={shapeKey} before={previous?.content ?? null} after={version.content} hideUnchanged={!!previous} />
      <Sources sources={cr.sources} />
      {version.upstream.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
          Checked against:
          {version.upstream.map((u) => (
            <span key={u.id} className="badge badge-xs badge-ghost">
              {u.upstreamVersion.artifact.dataType.name} v{u.upstreamVersion.versionNumber}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const HistoryPanel = ({ entry, onChanged }: { entry: CanonEntry; onChanged: () => void }) => {
  const [history, setHistory] = useState<History | null>(null)
  const [asOf, setAsOf] = useState("")
  const artifactId = entry.artifact!.id

  const load = useCallback(() => {
    canonActions.artifacts.getHistory(artifactId).then(setHistory)
  }, [artifactId])

  useEffect(() => { load() }, [load])

  const timeline = useMemo(() => {
    if (!history) return []
    const versions = history.versions.map((v, i) => ({ kind: "version" as const, at: new Date(v.createdAt), version: v, previous: history.versions[i + 1] }))
    const events = history.events
      .filter((e) => !coveredByVersions.has(e.eventTypeId))
      .map((e) => ({ kind: "event" as const, at: new Date(e.createdAt), event: e }))
    return [...versions, ...events].sort((a, b) => b.at.getTime() - a.at.getTime())
  }, [history])

  if (!history) return <div className="skeleton h-64 w-full" />

  const shapeKey = getShapeKey(history.dataType.shapeId)
  const pending = history.changeRequests.filter((cr) => cr.statusId === canonChangeRequestStatuses.underReview)
  const asOfVersion = asOf
    ? history.versions.find((v) => new Date(v.createdAt) <= new Date(`${asOf}T23:59:59`))
    : undefined

  const refresh = () => { load(); onChanged() }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{history.dataType.name}</h2>
          <p className="text-base-content/60">{history.versions.length} version{history.versions.length === 1 ? "" : "s"}</p>
        </div>
        <StatusBadge statusId={history.statusId} />
      </div>

      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold">Waiting for review</h3>
          {pending.map((cr) => (
            <PendingRequest key={cr.id} cr={cr} history={history} canReview={entry.canReview} onChanged={refresh} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold">As of</h3>
          <input type="date" className="input input-sm w-44" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          {asOf && <button className="btn btn-ghost btn-xs" onClick={() => setAsOf("")}>Clear</button>}
        </div>
        {asOf && (
          asOfVersion ? (
            <div className="rounded-lg border border-base-300 p-3">
              <p className="mb-2 text-sm text-base-content/60">v{asOfVersion.versionNumber}, in effect on {new Date(asOf).toLocaleDateString()}</p>
              <ContentView shapeKey={shapeKey} content={asOfVersion.content} />
            </div>
          ) : (
            <p className="text-sm italic text-base-content/60">There was no accepted value on that date.</p>
          )
        )}
      </section>

      <section className="flex flex-col">
        <h3 className="mb-3 font-semibold">Timeline</h3>
        {timeline.length === 0 && <p className="text-sm italic text-base-content/60">Nothing has been accepted yet.</p>}
        <ol className="relative border-l border-base-300">
          {timeline.map((t) => (
            <li key={t.kind === "version" ? t.version.id : t.event.id} className="mb-6 ml-5">
              <span className={`absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-base-100 ${t.kind === "version" ? "bg-primary" : "bg-base-content/30"}`} />
              {t.kind === "version" ? (
                <VersionEntry version={t.version} previous={t.previous} shapeKey={shapeKey} />
              ) : (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <TbClock className="size-4 text-base-content/50" />
                  <span className="font-medium">{t.event.eventType.name}</span>
                  {t.event.user && <span className="text-base-content/60">by {t.event.user.name}</span>}
                  <span className="text-base-content/50">{formatDate(t.event.createdAt)}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export default HistoryPanel
