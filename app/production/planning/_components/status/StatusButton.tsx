import { BprStatus } from "@/actions/production/bprs/statuses/getAll"
import CircleBadge from "@/components/UI/CircleBadge"
import { useBprPlanningActions, useBprPlanningSelection } from "@/store/bprPlanningSlice"

const StatusButton = ({ status }: { status: BprStatus }) => {

  const { currentStatusId, statusCounts } = useBprPlanningSelection()
  const { setCurrentStatusId } = useBprPlanningActions()
  const isActive = currentStatusId === status.id
  const count = statusCounts.get(status.id) || 0;


  return (
    <button
      className={`btn-lg btn ${isActive ? 'btn-secondary' : 'btn-soft'} flex w-full items-center justify-between`}
      onClick={() => setCurrentStatusId(status.id)}
    >
      <span>{status.name}</span>
      <CircleBadge size="sm" className="bg-info text-info-content">{count}</CircleBadge>
    </button>
  )
}

export default StatusButton
