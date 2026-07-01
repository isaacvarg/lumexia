import { useProductionActions, useProductionSelection } from "@/store/productionSlice"
import CircleBadge from "@/components/UI/CircleBadge";
import { ProductionStep } from "../../_actions/compounding/getSteps";

const StepButton = ({ step }: { step: ProductionStep }) => {
  const { setSelectedStep } = useProductionActions()
  const { selectedStep } = useProductionSelection()
  const isSelected = step.id === selectedStep?.id;

  return (
    <button
      onClick={() => setSelectedStep(step)}
      className={`btn ${step.isComplete ? 'btn-success line-through' : isSelected ? 'btn-accent' : 'btn-soft'} flex gap-4 items-center justify-start  btn-lg`}
    >
      <CircleBadge className="bg-secondary text-secondary-content">{step.batchStep.sequence}</CircleBadge>
      <span>{step.batchStep.label}</span>

    </button>
  )
}

export default StepButton
