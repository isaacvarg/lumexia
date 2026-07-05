import Card from "@/components/Card"
import { useTranslation } from "@/hooks/useTranslation"
import { useProductionSelection } from "@/store/productionSlice"
import { translations } from "../../_configs/translations"
import { useEffect, useState } from "react"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"

const Amounts = () => {

  const { selectedBomItem, stagings } = useProductionSelection()
  const [staged, setStaged] = useState<number>(0)
  const [remaining, setRemaining] = useState<number>(0)
  const { t } = useTranslation()

  useEffect(() => {
    if (!selectedBomItem) return;
    const required = selectedBomItem.quantity;
    const stagedAmount = stagings.reduce((acc, curr) => curr.quantity + acc, 0);
    const remaining = required - stagedAmount;
    setStaged(stagedAmount);
    setRemaining(remaining);

  }, [stagings, setStaged, setRemaining])


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      <Card.Root>
        <h1 className="font-poppins text-xl font-semibold text-base-content">
          {t(translations, 'amountRequired')}
        </h1>
        <p className="text-xl font-semibold text-base-content">{toFracitonalDigits.weight(selectedBomItem?.quantity || 0)} lbs </p>
      </Card.Root>

      <Card.Root>
        <h1 className="font-poppins text-xl font-semibold text-base-content">
          {t(translations, 'amountStaged')}
        </h1>
        <p className="text-xl font-semibold text-base-content">{toFracitonalDigits.weight(staged)} lbs </p>
      </Card.Root>

      <Card.Root>
        <h1 className="font-poppins text-xl font-semibold text-base-content">
          {t(translations, 'amountRemaining')}
        </h1>
        <p className="text-xl font-semibold text-base-content">{toFracitonalDigits.weight(remaining)} lbs </p>
      </Card.Root>




    </div>
  )
}

export default Amounts
