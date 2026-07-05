import { useBprPlanningSelection } from "@/store/bprPlanningSlice"
import StatusButton from "./StatusButton"
import BprCard from "./BprCard"

const StatusTab = () => {
  const { bprs, statuses, currentStatusId } = useBprPlanningSelection()
  const presentStatuses = statuses.filter(status => bprs[status.id])


  if (!currentStatusId) return false
  const currentBprs = bprs[currentStatusId] || []

  return (
    <div className="flex flex-col gap-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {presentStatuses.map(status => <StatusButton key={status.id} status={status} />)}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentBprs.map(bpr => <BprCard key={bpr.id} bpr={bpr} />)}
      </div>

    </div>
  )
}

export default StatusTab
