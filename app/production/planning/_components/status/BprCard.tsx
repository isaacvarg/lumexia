import { PlanningBpr } from "@/actions/production/getPlanningBprs"
import Card from "@/components/Card"
import { useRouter } from "next/navigation"

const BprCard = ({ bpr }: { bpr: PlanningBpr }) => {
  const router = useRouter()
  const { overview } = bpr

  return (
    <div className="bg-base-300  hover:cursor-pointer hover:bg-accent/45 p-6 rounded-xl"

      onClick={() => router.push(`/production/planning/${bpr.referenceCode}?id=${bpr.id}`)}
    >
      <div className="flex flex-col gap-4">
        <div className="badge badge-xl badge-info font-medium">
          {bpr.referenceCode}
        </div>

        <Card.Title>{bpr.producedItemName}</Card.Title>

        {overview && (
          <div className="flex flex-col gap-2 border-t border-base-content/10 pt-3">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="opacity-70">Waiting on:</span>
              <span className="badge badge-neutral badge-sm font-medium">{overview.teamLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <progress
                className="progress progress-success flex-1"
                value={overview.completed}
                max={overview.total || 1}
              />
              <span className="text-sm text-base-content/70 shrink-0">
                {overview.completed}/{overview.total}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default BprCard
