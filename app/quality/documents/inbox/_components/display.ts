import type { InboxRow } from "../_rows"

export const statusChip: Record<InboxRow["status"], { label: string; className: string }> = {
  pending: { label: "Unfiled", className: "badge-warning" },
  agentFiled: { label: "Filed by agent", className: "badge-info" },
  filed: { label: "Filed", className: "badge-success" },
  dismissed: { label: "Dismissed", className: "badge-ghost" },
}

export const sender = (m: InboxRow["message"]) => m.senderName || m.senderEmail || "Unknown sender"
