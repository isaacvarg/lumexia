import { useProductionSelection } from "@/store/productionSlice"
import SectionTitle from "@/components/Text/SectionTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { translations } from "../../_configs/translations";
import Card from "@/components/Card";
import StepButton from "./StepButton";

const StepList = () => {

  const { steps } = useProductionSelection()
  const { t } = useTranslation()

  const toDoSteps = steps.filter(step => !step.completedAt).sort((a, b) => a.batchStep.sequence - b.batchStep.sequence)
  const completedSteps = steps.filter(step => step.completedAt).sort((a, b) => a.batchStep.sequence - b.batchStep.sequence)


  return (
    <div className="flex flex-col gap-6 col-span-1 sm:col-span-2">

      <div className="flex flex-col gap-4">
        <SectionTitle >{t(translations, "compoundingTodo")}</SectionTitle>
        <Card.Root>

          <div className="flex flex-col gap-6">

            {toDoSteps.length === 0 && <p className={"text-base-content text-lg text-medium"}>{t(translations, 'compoundingAllCompleted')}</p>}

            <div className="grid grid-cols-1 gap-4">
              {toDoSteps.map(item => <StepButton key={item.id} step={item} />)}
            </div>
          </div>
        </Card.Root>
      </div>
      <div className="flex flex-col gap-4">
        <SectionTitle >{t(translations, "compoundingCompleted")}</SectionTitle>
        <Card.Root>
          <div className="grid grid-cols-1 gap-4">
            {completedSteps.map(item => <StepButton key={item.id} step={item} />)}
          </div>

        </Card.Root>
      </div>


    </div>
  )
}

export default StepList
