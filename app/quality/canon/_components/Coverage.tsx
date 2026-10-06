'use client'
import { Fragment, useState } from "react"
import { TbChevronDown, TbChevronRight, TbLink } from "react-icons/tb"
import type { CanonDashboard } from "@/lib/canon/dashboard"
import { canonArtifactStatuses } from "@/configs/staticRecords/canonArtifactStatuses"
import useOpenItemCanon from "@/hooks/useOpenItemCanon"
import Empty from "./Empty"

const attentionStatuses = [
  canonArtifactStatuses.stale,
  canonArtifactStatuses.unreviewedChange,
  canonArtifactStatuses.expired,
  canonArtifactStatuses.conflict,
]

const Coverage = ({ types }: { types: CanonDashboard["types"] }) => {
  const open = useOpenItemCanon()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (types.length === 0) return <Empty>No data types yet. They&apos;re set up in Settings → Canon.</Empty>

  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th />
            <th>Data type</th>
            <th>Applies to</th>
            <th className="w-1/4">Coverage</th>
            <th className="text-right">Current</th>
            <th className="text-right">Needs attention</th>
            <th className="text-right">Pending</th>
            <th className="text-right">Missing</th>
          </tr>
        </thead>
        <tbody>
          {types.map(({ dataType, counts, applicable, missingCount, missing }, index) => {
            const current = counts[canonArtifactStatuses.current] ?? 0
            const attention = attentionStatuses.reduce((sum, s) => sum + (counts[s] ?? 0), 0)
            const pending = counts[canonArtifactStatuses.pending] ?? 0
            const covered = applicable === null || missingCount === null ? null : applicable - missingCount
            const percent = covered === null || !applicable ? null : Math.round((covered / applicable) * 100)
            const canExpand = (missingCount ?? 0) > 0
            const isOpen = expanded === dataType.id

            // types arrive ordered by group, so a header goes wherever the group changes
            const groupChanged = index === 0 || types[index - 1].dataType.groupId !== dataType.groupId
            const anyGrouped = types.some((t) => t.dataType.groupId)

            return (
              <Fragment key={dataType.id}>
                {anyGrouped && groupChanged && (
                  <tr className="bg-base-200/60">
                    <td colSpan={8} className="py-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
                      {dataType.group?.name ?? "No group"}
                    </td>
                  </tr>
                )}
                <tr className={canExpand ? "hover cursor-pointer" : ""} onClick={() => canExpand && setExpanded(isOpen ? null : dataType.id)}>
                  <td className="w-6">{canExpand && (isOpen ? <TbChevronDown /> : <TbChevronRight />)}</td>
                  <td className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {dataType.name}
                      {dataType.resolverKey && <TbLink className="size-4 text-base-content/50" />}
                    </span>
                  </td>
                  <td className="text-base-content/70">{dataType.subjectType.name}</td>
                  <td>
                    {percent === null ? (
                      <span className="text-sm text-base-content/50">Per supplier</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <progress className={`progress w-full ${percent === 100 ? "progress-success" : "progress-primary"}`} value={percent} max={100} />
                        <span className="w-20 text-right text-sm tabular-nums">{covered}/{applicable}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-right tabular-nums">{current}</td>
                  <td className={`text-right tabular-nums ${attention > 0 ? "font-semibold text-warning" : ""}`}>{attention}</td>
                  <td className="text-right tabular-nums">{pending}</td>
                  <td className="text-right tabular-nums">{missingCount ?? "—"}</td>
                </tr>
                {isOpen && (
                  <tr>
                    <td />
                    <td colSpan={7}>
                      <div className="flex flex-wrap gap-2 py-2">
                        {missing.map((m, i) => (
                          <button key={i} onClick={() => open(m.item)} className="badge badge-lg badge-ghost hover:badge-primary">
                            {m.label}
                          </button>
                        ))}
                        {(missingCount ?? 0) > missing.length && (
                          <span className="text-sm text-base-content/60">and {(missingCount ?? 0) - missing.length} more</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Coverage
