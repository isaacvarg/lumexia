'use client'
import { useCanonReviewQueuePollingQuery } from "@/hooks/appQuery/useCanonReviewQueue"
import useOpenItemCanon, { canonItemOf, canonSubjectLabel } from "@/hooks/useOpenItemCanon"
import StatusBadge from "@/app/inventory/items/[name]/_components/canon/StatusBadge"
import UserIcon from "@/components/UI/UserIcon"
import Panel from "../Panel"

const Row = ({ title, subtitle, onClick, children }: { title: string; subtitle: string; onClick: () => void; children: React.ReactNode }) => (
  <div onClick={onClick} className="flex flex-col gap-2 rounded-xl bg-base-300/75 px-4 py-3 hover:cursor-pointer hover:bg-base-200">
    <div className="min-w-0">
      <h1 className="break-words font-poppins text-base font-medium text-base-content">{title}</h1>
      <p className="truncate text-sm text-base-content/60">{subtitle}</p>
    </div>
    <div className="flex items-center justify-between gap-2">{children}</div>
  </div>
)

const CanonReviews = () => {
  const open = useOpenItemCanon()
  const { data } = useCanonReviewQueuePollingQuery()

  if (!data) {
    return (
      <Panel title="Canon Reviews">
        <div className="grid grid-cols-1 gap-1">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      </Panel>
    )
  }

  const isComplete = data.changeRequests.length === 0 && data.attention.length === 0

  return (
    <Panel title="Canon Reviews" titlePath="/quality/canon">
      {isComplete && <p className="font-poppins text-lg font-medium text-base-content">All done 👍🏽👍🏽🫰🏽🫰🏽</p>}

      {!isComplete && (
        <div className="grid max-h-[250px] grid-cols-1 gap-1.5 overflow-y-auto overflow-x-hidden">
          {data.changeRequests.map((cr) => (
            <Row
              key={cr.id}
              title={`${cr.artifact.dataType.name}: ${cr.kind.name}`}
              subtitle={canonSubjectLabel(cr.artifact)}
              onClick={() => open(canonItemOf(cr.artifact))}
            >
              <span className="badge badge-warning badge-soft">Waiting for you</span>
              <span className="shrink-0">
                <UserIcon image={cr.requestedBy.image ?? undefined} name={cr.requestedBy.name ?? undefined} />
              </span>
            </Row>
          ))}
          {data.attention.map((artifact) => (
            <Row
              key={artifact.id}
              title={artifact.dataType.name}
              subtitle={canonSubjectLabel(artifact)}
              onClick={() => open(canonItemOf(artifact))}
            >
              <StatusBadge statusId={artifact.statusId} tooltip={false} />
            </Row>
          ))}
        </div>
      )}
    </Panel>
  )
}

export default CanonReviews
