import { IconType } from "react-icons"
import {
  TbAlertTriangle,
  TbCalendarQuestion,
  TbCircleCheck,
  TbCircleDashed,
  TbClockExclamation,
  TbMinus,
  TbRefreshAlert,
} from "react-icons/tb"
import { DateTime } from "luxon"
import { RequirementStatus } from "@/lib/itemDocuments/types"

export const statusDisplay: Record<RequirementStatus, { label: string; badge: string; text: string; icon: IconType; hint: string }> = {
  current: { label: "Current", badge: "badge-success", text: "text-success", icon: TbCircleCheck, hint: "On file and valid" },
  expiring: { label: "Expiring", badge: "badge-warning", text: "text-warning", icon: TbClockExclamation, hint: "Expires soon" },
  undated: { label: "Needs dates", badge: "badge-info", text: "text-info", icon: TbCalendarQuestion, hint: "Add an issue or expiry date so it can be checked" },
  stale: { label: "Source updated", badge: "badge-warning", text: "text-warning", icon: TbRefreshAlert, hint: "The supplier document it was based on has been replaced" },
  expired: { label: "Expired", badge: "badge-error", text: "text-error", icon: TbAlertTriangle, hint: "Past its expiry or issued before the cutoff" },
  missing: { label: "Missing", badge: "badge-error", text: "text-error", icon: TbCircleDashed, hint: "No document on file" },
  notApplicable: { label: "No lots", badge: "badge-ghost", text: "text-base-content/40", icon: TbMinus, hint: "No lots need this document" },
}

export const StatusBadge = ({ status, size = "sm" }: { status: RequirementStatus; size?: "xs" | "sm" }) => {
  const s = statusDisplay[status]
  const Icon = s.icon
  return (
    <span className={`badge badge-soft badge-${size} ${s.badge} gap-1 whitespace-nowrap`} title={s.hint}>
      <Icon className="size-3.5" />
      {s.label}
    </span>
  )
}

export const issuerLabel = (issuer: string) => (issuer === "internal" ? "Ours" : issuer === "any" ? "Either" : "Supplier")

// Document dates are calendar dates stored as UTC midnight, so they're shown in UTC to avoid a day shift.
export const formatDate = (d: Date | string | null | undefined) =>
  d ? DateTime.fromJSDate(new Date(d), { zone: "utc" }).toFormat("LLL d, yyyy") : null

// Dates go to and from <input type="date"> as UTC midnight so they don't shift a day across time zones.
export const toDateInput = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "")
export const fromDateInput = (v: string) => (v ? new Date(`${v}T00:00:00Z`) : null)

export const needsAttention = (status: RequirementStatus) => status !== "current" && status !== "notApplicable"
