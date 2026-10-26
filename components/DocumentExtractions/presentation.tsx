import { TbAlertTriangle, TbCircleCheck, TbCircleDashed, TbEye, TbFileText, TbScan, TbUser, TbZoomQuestion } from "react-icons/tb"
import { IconType } from "react-icons"

// How document extractions look wherever they show up: the Files tab, the review queue, settings.

export type ExtractionSummary = {
  extractionStatus: "missing" | "current" | "failed" | "not_checked"
  reviewState?: string
  needsHumanCheck?: number
  facts?: number
  failureReason?: string
}

export const extractionSummaryDisplay = (s: ExtractionSummary | undefined): { label: string; badge: string; icon: IconType; hint: string } => {
  if (!s || s.extractionStatus === "missing" || s.extractionStatus === "not_checked") {
    return { label: "Not extracted", badge: "badge-ghost", icon: TbCircleDashed, hint: "The extraction agent hasn't read this file yet" }
  }
  if (s.extractionStatus === "failed") {
    return { label: "Unreadable", badge: "badge-error", icon: TbAlertTriangle, hint: s.failureReason ?? "The extraction agent couldn't read this file" }
  }
  if (s.needsHumanCheck) {
    return { label: `${s.needsHumanCheck} to check`, badge: "badge-warning", icon: TbZoomQuestion, hint: "Facts read from page images or OCR wait for a person's check" }
  }
  if (s.reviewState === "verified") return { label: "Verified", badge: "badge-success", icon: TbCircleCheck, hint: "People checked the facts that matter" }
  return { label: "Extracted", badge: "badge-info", icon: TbFileText, hint: `${s.facts ?? 0} facts read by the extraction agent, not yet checked` }
}

export const ExtractionBadge = ({ summary, size = "xs" }: { summary: ExtractionSummary | undefined; size?: "xs" | "sm" }) => {
  const d = extractionSummaryDisplay(summary)
  const Icon = d.icon
  return (
    <span className={`badge badge-soft badge-${size} ${d.badge} gap-1 whitespace-nowrap`} title={d.hint}>
      <Icon className="size-3.5" />
      {d.label}
    </span>
  )
}

export const methodDisplay: Record<string, { label: string; icon: IconType; hint: string }> = {
  text_layer: { label: "Text", icon: TbFileText, hint: "Read from the PDF's text layer" },
  vision: { label: "Vision", icon: TbEye, hint: "Read from page images by a vision model" },
  ocr: { label: "OCR", icon: TbScan, hint: "Read by OCR" },
  human: { label: "Person", icon: TbUser, hint: "Entered by a person" },
}

export const MethodBadge = ({ method }: { method: string }) => {
  const d = methodDisplay[method] ?? { label: method, icon: TbFileText, hint: method }
  const Icon = d.icon
  return (
    <span className="badge badge-ghost badge-xs gap-1 whitespace-nowrap" title={d.hint}>
      <Icon className="size-3" />
      {d.label}
    </span>
  )
}

export const reviewStateLabel: Record<string, string> = {
  unreviewed: "Not reviewed",
  partially_verified: "Partly verified",
  verified: "Verified",
}

// The sheet's page label when it has one, else the PDF page counted from 1.
export const pageLabel = (page: { index: number | null; label: string | null }) =>
  page.label ? `p. ${page.label}` : page.index !== null ? `p. ${page.index + 1}` : null

// A PDF link that opens at the fact's page.
export const pageHref = (url: string, index: number | null) => (index !== null ? `${url}#page=${index + 1}` : url)

// How a fact reads in a list: a table row as its columns joined ("Linalool · 78-70-6 · 25-35%"), leaving out
// the number columns kept only for search (…_min, …_max, …_value); a claim without underscores.
export const factText = (f: { kind?: string; value: unknown; printed: string | null }) => {
  if (f.kind === "row" && f.value && typeof f.value === "object" && !Array.isArray(f.value)) {
    // stored JSON loses the column order, so the column naming the row goes first
    const lead = ["chemical", "test", "hazard_class", "category", "topic", "mode", "code", "route", "basis"]
    const rank = (k: string) => (lead.includes(k) ? lead.indexOf(k) : lead.length)
    return Object.entries(f.value as Record<string, unknown>)
      .filter(([k]) => !/_(min|max|value)$/.test(k))
      .sort(([a], [b]) => rank(a) - rank(b))
      .map(([, v]) => (Array.isArray(v) ? v.join(", ") : String(v)))
      .join(" · ")
  }
  if (f.kind === "claim") return f.printed?.replace(/_/g, " ") ?? ""
  return f.printed ?? ""
}
