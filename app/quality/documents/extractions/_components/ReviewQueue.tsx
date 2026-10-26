'use client'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TbAlertTriangle, TbArrowsDiff, TbChevronDown, TbChevronRight, TbGitCompare, TbZoomQuestion } from "react-icons/tb"
import type { ExtractionReviewQueue } from "@/lib/documentExtractions/queries"
import type { Finding } from "@/lib/documentExtractions/crossChecks"
import ExtractionPanel from "@/components/DocumentExtractions/ExtractionPanel"
import { MethodBadge } from "@/components/DocumentExtractions/presentation"
import { slugify } from "@/utils/slug"

type Row = ExtractionReviewQueue["toCheck"][number]
type View = "toCheck" | "conflicts" | "failed" | "crossChecks"

const views: { view: View; label: string; icon: typeof TbZoomQuestion; empty: string }[] = [
  { view: "toCheck", label: "Facts to check", icon: TbZoomQuestion, empty: "Nothing waits for a check." },
  { view: "conflicts", label: "Changed on re-read", icon: TbArrowsDiff, empty: "No re-read changed a verified fact." },
  { view: "failed", label: "Unreadable", icon: TbAlertTriangle, empty: "The agent could read every document." },
  { view: "crossChecks", label: "Cross-checks", icon: TbGitCompare, empty: "The sheets agree with each other and with the items' INCI aliases." },
]

const checkLabel: Record<Finding["check"], string> = {
  same_cas_different_names: "Same CAS, different names",
  regulatory_disagreement: "Regulatory listings disagree",
  implied_classification: "Component hazard not in classification",
  inci_mismatch: "INCI doesn't match aliases",
}

const itemHref = (item: { id: string; name: string }) => `/inventory/items/${slugify(item.name)}?id=${item.id}&tab=files`

// One cross-check finding with the facts behind it, each with the items whose documents state it.
const FindingRow = ({ finding }: { finding: Finding }) => (
  <li className="flex flex-col gap-2 px-4 py-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className={`badge badge-soft badge-sm ${finding.severity === "warning" ? "badge-warning" : "badge-info"}`}>{checkLabel[finding.check]}</span>
      <span className="font-medium">{finding.summary}</span>
    </div>
    <ul className="flex flex-col gap-1 border-l-2 border-base-300 pl-3 text-xs">
      {finding.facts.map((f) => (
        <li key={f.factId} className="flex flex-wrap gap-x-2">
          <span>{f.items.map((i, n) => <span key={i.id}>{n > 0 && ", "}<Link href={itemHref(i)} className="link">{i.name}</Link></span>)}</span>
          <span className="text-base-content/70">{f.printed}</span>
          <span className="text-base-content/50">{f.page && `${f.page} `}<q className="italic">{f.quote}</q></span>
        </li>
      ))}
    </ul>
  </li>
)

const documentHref = (doc: Row["documents"][number]) => `/inventory/items/${slugify(doc.item.name)}?id=${doc.item.id}&tab=files&document=${doc.id}`

const QueueRow = ({ row, view, onChanged }: { row: Row; view: View; onChanged: () => void }) => {
  const [open, setOpen] = useState(false)
  const first = row.documents[0]
  return (
    <li>
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-start gap-3 text-left" aria-expanded={open}>
          {open ? <TbChevronDown className="mt-1 shrink-0" /> : <TbChevronRight className="mt-1 shrink-0" />}
          <div className="min-w-0">
            <div className="font-medium">
              {row.documents.map((d) => d.item.name).filter((n, i, all) => all.indexOf(n) === i).join(", ")}
            </div>
            <div className="truncate text-sm text-base-content/60">
              {first.type} · {first.name}
              {first.supplier && ` · ${first.supplier}`}
            </div>
            {view === "toCheck" && <div className="text-xs text-base-content/60">{row.keysToCheck.join(", ")}</div>}
            {view === "failed" && row.failureReason && <div className="text-xs text-error">{row.failureReason}</div>}
          </div>
        </button>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {view === "toCheck" && <span className="badge badge-warning badge-soft badge-sm">{row.toCheck} to check</span>}
          {view === "conflicts" && <span className="badge badge-warning badge-soft badge-sm">{row.conflicts} changed</span>}
          {row.methods.map((m) => <MethodBadge key={m} method={m} />)}
          <Link href={documentHref(first)} className="btn btn-ghost btn-xs">Open item</Link>
        </div>
      </div>
      {open && (
        <div className="border-t border-base-300 bg-base-200/30 p-4">
          <ExtractionPanel documentId={first.id} fileUrl={undefined} onChanged={onChanged} />
        </div>
      )}
    </li>
  )
}

const ReviewQueue = ({ queue, crossChecks }: { queue: ExtractionReviewQueue; crossChecks: Finding[] }) => {
  const router = useRouter()
  const [view, setView] = useState<View>("toCheck")
  const rows = view === "crossChecks" ? [] : queue[view]
  const count = (v: View) => (v === "crossChecks" ? crossChecks.length : queue[v].length)
  const current = views.find((v) => v.view === view)!

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-base-content/70">
        The extraction agent reads supplier documents into facts. Facts it read from page images or OCR on
        safety-relevant keys wait here for a person to compare with the document. Verifying or correcting a fact
        applies to every document filed with the same file.
      </p>
      <div role="tablist" className="tabs tabs-box w-fit">
        {views.map((v) => (
          <button key={v.view} role="tab" type="button" aria-selected={view === v.view} className={`tab gap-2 ${view === v.view ? "tab-active" : ""}`} onClick={() => setView(v.view)}>
            <v.icon className="size-4" /> {v.label}
            <span className="badge badge-sm">{count(v.view)}</span>
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        {view === "crossChecks" ? (
          crossChecks.length === 0 ? (
            <p className="p-6 text-center text-sm text-base-content/60">{current.empty}</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {crossChecks.map((f, i) => <FindingRow key={i} finding={f} />)}
            </ul>
          )
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-base-content/60">{current.empty}</p>
        ) : (
          <ul className="divide-y divide-base-300">
            {rows.map((row) => <QueueRow key={row.id} row={row} view={view} onChanged={() => router.refresh()} />)}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ReviewQueue
