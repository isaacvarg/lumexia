'use client'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TbAlertTriangle, TbArrowsDiff, TbChevronDown, TbChevronRight, TbZoomQuestion } from "react-icons/tb"
import type { ExtractionReviewQueue } from "@/lib/documentExtractions/queries"
import ExtractionPanel from "@/components/DocumentExtractions/ExtractionPanel"
import { MethodBadge } from "@/components/DocumentExtractions/presentation"
import { slugify } from "@/utils/slug"

type Row = ExtractionReviewQueue["toCheck"][number]
type View = "toCheck" | "conflicts" | "failed"

const views: { view: View; label: string; icon: typeof TbZoomQuestion; empty: string }[] = [
  { view: "toCheck", label: "Facts to check", icon: TbZoomQuestion, empty: "Nothing waits for a check." },
  { view: "conflicts", label: "Changed on re-read", icon: TbArrowsDiff, empty: "No re-read changed a verified fact." },
  { view: "failed", label: "Unreadable", icon: TbAlertTriangle, empty: "The agent could read every document." },
]

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

const ReviewQueue = ({ queue }: { queue: ExtractionReviewQueue }) => {
  const router = useRouter()
  const [view, setView] = useState<View>("toCheck")
  const rows = queue[view]
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
            <span className="badge badge-sm">{queue[v.view].length}</span>
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        {rows.length === 0 ? (
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
