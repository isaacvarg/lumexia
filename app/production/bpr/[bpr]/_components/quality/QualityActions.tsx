import Card from "@/components/Card"
import CircleBadge from "@/components/UI/CircleBadge"
import ButtonApproveAll from "./ButtonApproveAll"
import ButtonCompleteVerification from "./ButtonCompleteVerification"
import { useProductionActions, useProductionSelection } from "@/store/productionSlice"
import { TbPlus } from "react-icons/tb"
import { translations } from "../../_configs/translations"
import { useTranslation } from "@/hooks/useTranslation"

const QualityActions = () => {


  const { t } = useTranslation()
  const { bprNotes } = useProductionSelection()
  const { setQualityDetailsViewMode } = useProductionActions()

  return (
    <Card.Root>

      <Card.Title>Actions</Card.Title>

      <div className="grid grid-cols-1 gap-2">

        <ButtonCompleteVerification />

        <button className="btn btn-lg btn-accent min-h-20" onClick={() => setQualityDetailsViewMode('note')}>
          <div className="flex gap-2 items-center">
            <TbPlus className="text-base-content text-3xl" />
            {t(translations, 'notesButton')}

          </div>
          <CircleBadge className="bg-primary/50">{bprNotes.length}</CircleBadge>
        </button>

      </div>
    </Card.Root>

  )
}

export default QualityActions
