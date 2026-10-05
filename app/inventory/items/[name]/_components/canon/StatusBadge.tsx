import { canonArtifactStatuses } from "@/configs/staticRecords/canonArtifactStatuses"

const labels: Record<string, { label: string; className: string; hint: string }> = {
  [canonArtifactStatuses.pending]: { label: "Pending", className: "badge-ghost", hint: "No accepted value yet." },
  [canonArtifactStatuses.current]: { label: "Current", className: "badge-success", hint: "Accepted and up to date." },
  [canonArtifactStatuses.stale]: { label: "Needs review", className: "badge-warning", hint: "Something it depends on changed." },
  [canonArtifactStatuses.unreviewedChange]: { label: "Source changed", className: "badge-warning", hint: "The Lumexia source changed and hasn't been accepted." },
  [canonArtifactStatuses.expired]: { label: "Expired", className: "badge-error", hint: "Its evidence is past the re-verify date." },
  [canonArtifactStatuses.conflict]: { label: "Conflict", className: "badge-error", hint: "Supplier statements disagree." },
}

const StatusBadge = ({ statusId }: { statusId: string | null }) => {
  const status = statusId ? labels[statusId] : { label: "Not set", className: "badge-ghost", hint: "No value has been proposed yet." }
  return (
    <span className={`badge badge-soft tooltip tooltip-bottom ${status.className}`} data-tip={status.hint}>
      {status.label}
    </span>
  )
}

export default StatusBadge
