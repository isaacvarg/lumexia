'use client'
import { useMemo, useState } from "react"
import type { CanonDashboard } from "@/lib/canon/dashboard"
import useOpenItemCanon, { canonItemOf, canonSubjectLabel } from "@/hooks/useOpenItemCanon"
import StatusBadge from "@/app/inventory/items/[name]/_components/canon/StatusBadge"
import Empty from "./Empty"

const since = (d: Date | string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000)
  return days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`
}

const Attention = ({ attention }: { attention: CanonDashboard["attention"] }) => {
  const open = useOpenItemCanon()
  const [statusId, setStatusId] = useState("")
  const [dataTypeId, setDataTypeId] = useState("")

  const statuses = useMemo(() => Array.from(new Map(attention.map((a) => [a.statusId, a.status.name]))), [attention])
  const dataTypes = useMemo(() => Array.from(new Map(attention.map((a) => [a.dataType.id, a.dataType.name]))), [attention])

  const rows = attention.filter((a) => (!statusId || a.statusId === statusId) && (!dataTypeId || a.dataType.id === dataTypeId))

  if (attention.length === 0) return <Empty>Everything is current. Nothing needs attention.</Empty>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select className="select select-sm w-48" value={statusId} onChange={(e) => setStatusId(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select className="select select-sm w-56" value={dataTypeId} onChange={(e) => setDataTypeId(e.target.value)}>
          <option value="">All data types</option>
          {dataTypes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr><th>Data type</th><th>Subject</th><th>Status</th><th>Version</th><th className="text-right">Since</th></tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="hover cursor-pointer" onClick={() => open(canonItemOf(a))}>
                <td className="font-medium">{a.dataType.name}</td>
                <td>{canonSubjectLabel(a)}</td>
                <td><StatusBadge statusId={a.statusId} tooltip={false} /></td>
                <td>{a.currentVersion ? `v${a.currentVersion.versionNumber}` : "—"}</td>
                <td className="text-right text-base-content/60">{since(a.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attention
