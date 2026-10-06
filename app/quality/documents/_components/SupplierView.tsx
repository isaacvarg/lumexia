'use client'
import { useState } from "react"
import Link from "next/link"
import { TbCheck, TbCopy } from "react-icons/tb"
import { formatDate, statusDisplay, StatusBadge } from "@/components/ItemDocuments/presentation"
import { RequirementStatus } from "@/lib/itemDocuments/types"
import { IssueRow, severity } from "./useIssueRows"

type Group = { id: string | null; name: string; rows: IssueRow[] }

const describe = (r: IssueRow) => {
  const doc = r.fileType?.name ?? "Document"
  const what = r.lotNumber ? `${doc} for lot ${r.lotNumber}` : doc
  const state =
    r.status === "missing" ? "missing"
      : r.status === "expired" ? `expired${r.expiresAt ? ` ${formatDate(r.expiresAt)}` : ""}`
        : r.status === "expiring" ? `expires ${formatDate(r.expiresAt)}`
          : statusDisplay[r.status].label.toLowerCase()
  return `${r.item?.name}${r.item?.referenceCode ? ` (${r.item.referenceCode})` : ""}: ${what}, ${state}`
}

// Plain text to paste into an email to the supplier.
const requestText = (group: Group) =>
  [`Documents needed from ${group.name}:`, ...group.rows.map((r) => `- ${describe(r)}`)].join("\n")

const SupplierCard = ({ group }: { group: Group }) => {
  const [copied, setCopied] = useState(false)
  const counts = group.rows.reduce<Partial<Record<RequirementStatus, number>>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})

  const copy = async () => {
    await navigator.clipboard.writeText(requestText(group))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 bg-base-200/60 px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{group.name}</h3>
          {(Object.keys(counts) as RequirementStatus[])
            .sort((a, b) => severity[a] - severity[b])
            .map((s) => (
              <span key={s} className="flex items-center gap-1 text-xs">
                <StatusBadge status={s} size="xs" />×{counts[s]}
              </span>
            ))}
        </div>
        {group.id && (
          <button type="button" onClick={copy} className="btn btn-ghost btn-xs">
            {copied ? <><TbCheck className="text-success" /> Copied</> : <><TbCopy /> Copy request list</>}
          </button>
        )}
      </header>
      <ul className="divide-y divide-base-300">
        {group.rows.map((r) => (
          <li key={r.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
            <div className="min-w-0">
              <Link href={r.href} className="font-medium hover:underline">{r.item?.name}</Link>
              <span className="text-base-content/60">
                {" "}· {r.fileType?.name}
                {r.lotNumber && ` · lot ${r.lotNumber}`}
                {r.supplierSource === "purchaseHistory" && " · supplier from purchase history"}
              </span>
            </div>
            <StatusBadge status={r.status} size="xs" />
          </li>
        ))}
      </ul>
    </section>
  )
}

// Supplier-issued issues grouped by the supplier to ask. Our own documents aren't listed here.
const SupplierView = ({ rows }: { rows: IssueRow[] }) => {
  const supplierRows = rows.filter((r) => r.issuer !== "internal")
  const groups = Array.from(
    supplierRows
      .reduce((map, r) => {
        const key = r.supplierId ?? ""
        const group = map.get(key) ?? { id: r.supplierId, name: r.supplier?.name ?? "No supplier on record", rows: [] }
        group.rows.push(r)
        return map.set(key, group)
      }, new Map<string, Group>())
      .values()
  ).sort((a, b) => (!a.id !== !b.id ? (a.id ? -1 : 1) : b.rows.length - a.rows.length))

  if (groups.length === 0) {
    return <p className="rounded-xl border border-dashed border-base-300 px-4 py-8 text-center text-base-content/60">No supplier documents need attention for these filters.</p>
  }

  return <div className="flex flex-col gap-4">{groups.map((g) => <SupplierCard key={g.id ?? "none"} group={g} />)}</div>
}

export default SupplierView
