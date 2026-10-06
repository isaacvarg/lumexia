'use client'
import { useMemo, useState } from "react"
import { TbBuildingStore, TbList, TbSearch, TbX } from "react-icons/tb"
import type { DocumentDashboard } from "@/lib/itemDocuments/dashboard"
import { RequirementStatus } from "@/lib/itemDocuments/types"
import { statusDisplay } from "@/components/ItemDocuments/presentation"
import StatCards from "./StatCards"
import IssueTable from "./IssueTable"
import SupplierView from "./SupplierView"
import { useIssueRows } from "./useIssueRows"

const statusOptions: RequirementStatus[] = ["missing", "expired", "stale", "undated", "expiring"]

type Filters = {
  statuses: RequirementStatus[]
  issuer: "" | "supplier" | "internal"
  scope: "" | "item" | "lot"
  itemTypeId: string
  fileTypeId: string
  supplierId: string
  query: string
}

const noFilters: Filters = { statuses: [], issuer: "", scope: "", itemTypeId: "", fileTypeId: "", supplierId: "", query: "" }

const presets: { label: string; filters: Partial<Filters> }[] = [
  { label: "Missing our branded documents", filters: { issuer: "internal", statuses: ["missing"] } },
  { label: "Our documents to revisit", filters: { issuer: "internal", statuses: ["expiring", "expired", "stale"] } },
  { label: "Expired or expiring", filters: { statuses: ["expired", "expiring"] } },
  { label: "Lot documents missing", filters: { scope: "lot", statuses: ["missing"] } },
  { label: "Needs dates", filters: { statuses: ["undated"] } },
]

const sameFilters = (a: Filters, b: Filters) =>
  JSON.stringify({ ...a, statuses: [...a.statuses].sort() }) === JSON.stringify({ ...b, statuses: [...b.statuses].sort() })

const Dashboard = ({ data }: { data: DocumentDashboard }) => {
  const rows = useIssueRows(data)
  const [view, setView] = useState<"issues" | "suppliers">("issues")
  const [filters, setFilters] = useState<Filters>(noFilters)
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }))
  const toggleStatus = (s: RequirementStatus) =>
    set("statuses", filters.statuses.includes(s) ? filters.statuses.filter((x) => x !== s) : [...filters.statuses, s])

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (filters.statuses.length === 0 || filters.statuses.includes(r.status)) &&
        (!filters.issuer || r.issuer === filters.issuer || r.issuer === "any") &&
        (!filters.scope || r.scope === filters.scope) &&
        (!filters.itemTypeId || r.itemTypeId === filters.itemTypeId) &&
        (!filters.fileTypeId || r.fileTypeId === filters.fileTypeId) &&
        (!filters.supplierId || (filters.supplierId === "none" ? !r.supplierId && r.issuer !== "internal" : r.supplierId === filters.supplierId)) &&
        (!q || [r.item?.name, r.item?.referenceCode, r.lotNumber, r.supplier?.name, r.documentName].some((s) => s?.toLowerCase().includes(q)))
    )
  }, [rows, filters])

  const itemTypes = useMemo(
    () => Array.from(new Map(data.items.map((i) => [i.itemTypeId, i.itemTypeName]))).sort((a, b) => a[1].localeCompare(b[1])),
    [data.items]
  )
  const sortedSuppliers = useMemo(() => [...data.suppliers].sort((a, b) => a.name.localeCompare(b.name)), [data.suppliers])
  const filtering = !sameFilters(filters, noFilters)

  if (data.summary.items === 0) {
    return (
      <p className="rounded-xl border border-dashed border-base-300 px-4 py-10 text-center text-base-content/60">
        No document requirements apply to any items yet. Set them up under Settings → Inventory → Documents.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <StatCards summary={data.summary} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-base-content/60">Views:</span>
          {presets.map((p) => {
            const target = { ...noFilters, ...p.filters }
            const active = sameFilters(filters, target)
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters(active ? noFilters : target)}
                className={`btn btn-sm ${active ? "btn-primary" : "btn-ghost border-base-300"}`}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((s) => {
              const active = filters.statuses.includes(s)
              const Icon = statusDisplay[s].icon
              const count = rows.filter((r) => r.status === s).length
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleStatus(s)}
                  className={`badge badge-md gap-1 ${statusDisplay[s].badge} ${active ? "" : "badge-soft"}`}
                >
                  <Icon className="size-3.5" />
                  {statusDisplay[s].label} <span className="opacity-70">{count}</span>
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <label className="input input-sm lg:col-span-2">
              <TbSearch className="text-base-content/50" />
              <input type="search" placeholder="Item, code, lot, supplier" value={filters.query} onChange={(e) => set("query", e.target.value)} />
            </label>
            <select aria-label="Issued by" className="select select-sm" value={filters.issuer} onChange={(e) => set("issuer", e.target.value as Filters["issuer"])}>
              <option value="">Supplier and ours</option>
              <option value="supplier">Supplier documents</option>
              <option value="internal">Our documents</option>
            </select>
            <select aria-label="Item type" className="select select-sm" value={filters.itemTypeId} onChange={(e) => set("itemTypeId", e.target.value)}>
              <option value="">All item types</option>
              {itemTypes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <select aria-label="Document type" className="select select-sm" value={filters.fileTypeId} onChange={(e) => set("fileTypeId", e.target.value)}>
              <option value="">All documents</option>
              {data.fileTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select aria-label="Supplier" className="select select-sm" value={filters.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
              <option value="">All suppliers</option>
              <option value="none">No supplier on record</option>
              {sortedSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="join">
          <button type="button" aria-pressed={view === "issues"} onClick={() => setView("issues")} className={`btn btn-sm join-item ${view === "issues" ? "btn-neutral" : "btn-ghost border-base-300"}`}>
            <TbList /> Issues
          </button>
          <button type="button" aria-pressed={view === "suppliers"} onClick={() => setView("suppliers")} className={`btn btn-sm join-item ${view === "suppliers" ? "btn-neutral" : "btn-ghost border-base-300"}`}>
            <TbBuildingStore /> By supplier
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          {filtered.length} of {rows.length} issues
          {filtering && (
            <button type="button" onClick={() => setFilters(noFilters)} className="btn btn-ghost btn-xs"><TbX /> Clear filters</button>
          )}
        </div>
      </div>

      {view === "issues" ? <IssueTable rows={filtered} /> : <SupplierView rows={filtered} />}
    </div>
  )
}

export default Dashboard
