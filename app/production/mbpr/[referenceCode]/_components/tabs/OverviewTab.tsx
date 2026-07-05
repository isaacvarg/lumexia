import { useMbprDetailsSelection } from "@/store/mbprDetailsSlice"
import BasicsPanel from "../BasicsPanel"
import BatchSizesPanel from "../BatchSizesPanel"
import BOMPanel from "../BOMPanel"

const OverviewTab = () => {
  const { mbpr, statuses } = useMbprDetailsSelection()

  if (!mbpr) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <BasicsPanel mbpr={mbpr} statuses={statuses} />
      <BatchSizesPanel sizes={mbpr.BatchSize} />
      <BOMPanel bom={mbpr.bom} />
    </div>
  )
}

export default OverviewTab
