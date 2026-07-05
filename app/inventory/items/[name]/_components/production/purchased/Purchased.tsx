import { useItemSelection } from "@/store/itemSlice"
import UsageTable from "./UsageTable"
import ConsumptionChart from "./ConsumptionChart"
import ConsumptionStats from "./ConsumptionStats"
import UsageChart from "./UsageChart"

const Purchased = () => {

  const { usage } = useItemSelection()

  console.log(usage)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <ConsumptionChart />
      <UsageChart />
      <ConsumptionStats />
      <UsageTable />

    </div>
  )
}

export default Purchased
