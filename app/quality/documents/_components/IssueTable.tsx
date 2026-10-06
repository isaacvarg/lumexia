'use client'
import { useState } from "react"
import Link from "next/link"
import { formatDate, issuerLabel, StatusBadge } from "@/components/ItemDocuments/presentation"
import { IssueRow } from "./useIssueRows"

const PAGE = 100

export const supplierSourceHint: Record<string, string> = {
  document: "",
  lot: "from the lot's purchase order",
  purchaseHistory: "last ordered from",
}

const IssueTable = ({ rows }: { rows: IssueRow[] }) => {
  const [limit, setLimit] = useState(PAGE)

  if (rows.length === 0) {
    return <p className="rounded-xl border border-dashed border-base-300 px-4 py-8 text-center text-base-content/60">Nothing needs attention for these filters.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Item</th>
              <th>Document</th>
              <th>Status</th>
              <th>Supplier</th>
              <th>On file</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((r) => (
              <tr key={r.key} className="hover:bg-base-200/50">
                <td>
                  <Link href={r.href} className="font-medium hover:underline">{r.item?.name}</Link>
                  <div className="text-xs text-base-content/50">{r.item?.referenceCode} · {r.item?.itemTypeName}</div>
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.fileType && (
                      <span className="rounded-md px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: r.fileType.bgColor, color: r.fileType.textColor }}>
                        {r.fileType.abbreviaton || r.fileType.name}
                      </span>
                    )}
                    <span className="text-xs text-base-content/60">{issuerLabel(r.issuer)}</span>
                  </div>
                  {r.lotNumber && <div className="text-xs text-base-content/50">Lot {r.lotNumber}</div>}
                </td>
                <td><StatusBadge status={r.status} size="xs" /></td>
                <td>
                  {r.supplier ? (
                    <>
                      <div className="text-sm">{r.supplier.name}</div>
                      {r.supplierSource && supplierSourceHint[r.supplierSource] && (
                        <div className="text-xs text-base-content/50">{supplierSourceHint[r.supplierSource]}</div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-base-content/40">{r.issuer === "internal" ? "Ours" : "Unknown"}</span>
                  )}
                </td>
                <td className="max-w-56">
                  {r.documentName ? (
                    <>
                      <div className="truncate text-sm" title={r.documentName}>{r.documentName}</div>
                      {r.expiresAt && <div className="text-xs text-base-content/50">Expires {formatDate(r.expiresAt)}</div>}
                    </>
                  ) : (
                    <span className="text-sm text-base-content/40">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <div className="border-t border-base-300 p-2 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-ghost btn-sm">
            Show {Math.min(PAGE, rows.length - limit)} more of {rows.length - limit}
          </button>
        </div>
      )}
    </div>
  )
}

export default IssueTable
