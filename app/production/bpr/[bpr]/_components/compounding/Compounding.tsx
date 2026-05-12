import { useProductionSelection } from "@/store/productionSlice"
import StepList from "./StepList"
import StepDetails from "./StepDetails"
import CompoundingHeader from "./CompoundingHeader"

const Compounding = () => {
  const { selectedStep } = useProductionSelection()

  return (
    <div className="flex flex-col gap-6">
      <CompoundingHeader />
      {!selectedStep && <StepList />}
      {selectedStep && <StepDetails />}
    </div>

  )
}

export default Compounding
