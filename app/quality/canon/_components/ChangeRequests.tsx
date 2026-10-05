'use client'
import type { CanonDashboard } from "@/lib/canon/dashboard"
import useOpenItemCanon, { canonItemOf, canonSubjectLabel } from "@/hooks/useOpenItemCanon"
import UserIcon from "@/components/UI/UserIcon"
import Empty from "./Empty"

const age = (d: Date | string) => {
  const hours = Math.floor((Date.now() - new Date(d).getTime()) / 3_600_000)
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`
}

const ChangeRequests = ({ changeRequests }: { changeRequests: CanonDashboard["changeRequests"] }) => {
  const open = useOpenItemCanon()

  if (changeRequests.length === 0) return <Empty>No change requests are waiting for review.</Empty>

  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr><th>CR</th><th>Data type</th><th>Subject</th><th>Kind</th><th>Requested by</th><th>Approvals</th><th className="text-right">Age</th></tr>
        </thead>
        <tbody>
          {changeRequests.map((cr) => {
            const approvals = cr.reviews.filter((r) => r.approved).length
            return (
              <tr key={cr.id} className="hover cursor-pointer" onClick={() => open(canonItemOf(cr.artifact))}>
                <td className="font-mono text-sm">CR-{cr.referenceCode}</td>
                <td className="font-medium">{cr.artifact.dataType.name}</td>
                <td>{canonSubjectLabel(cr.artifact)}</td>
                <td><span className="badge badge-sm badge-soft">{cr.kind.name}</span></td>
                <td>
                  <span className="inline-flex items-center gap-2">
                    <UserIcon image={cr.requestedBy.image ?? undefined} name={cr.requestedBy.name ?? undefined} />
                    {cr.requestedBy.name}
                  </span>
                </td>
                <td>{approvals}/{cr.artifact.dataType.requiredApprovals}</td>
                <td className="text-right text-base-content/60">{age(cr.createdAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ChangeRequests
