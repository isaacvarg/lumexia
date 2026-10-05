'use client'
import type { CanonDashboard } from "@/lib/canon/dashboard"
import useOpenItemCanon, { canonItemOf, canonSubjectLabel } from "@/hooks/useOpenItemCanon"
import Empty from "./Empty"

const formatDate = (d: Date | string) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })

const Activity = ({ events }: { events: CanonDashboard["events"] }) => {
  const open = useOpenItemCanon()

  if (events.length === 0) return <Empty>No activity yet.</Empty>

  return (
    <ol className="relative ml-2 border-l border-base-300">
      {events.map((e) => (
        <li key={e.id} className="mb-4 ml-5">
          <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-base-100 bg-base-content/30" />
          <button onClick={() => open(canonItemOf(e.artifact))} className="text-left hover:text-primary">
            <span className="font-medium">{e.eventType.name}</span>
            {e.version && <span> · v{e.version.versionNumber}</span>}
            <span className="text-base-content/70"> · {e.artifact.dataType.name} · {canonSubjectLabel(e.artifact)}</span>
          </button>
          <div className="text-sm text-base-content/50">
            {formatDate(e.createdAt)}{e.user && ` · ${e.user.name}`}
          </div>
        </li>
      ))}
    </ol>
  )
}

export default Activity
