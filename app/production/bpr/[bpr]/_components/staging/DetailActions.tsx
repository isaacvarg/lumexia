import Card from "@/components/Card"
import CircleBadge from "@/components/UI/CircleBadge"
import { useTranslation } from "@/hooks/useTranslation"
import { translations } from "../../_configs/translations"
import { TbPlus } from "react-icons/tb"
import { useProductionActions, useProductionSelection } from "@/store/productionSlice"
import CompleteStagingButton from "./CompleteStagingButton"

const DetailActions = () => {
  const { t } = useTranslation()
  const { setStagingDetailsMode } = useProductionActions()
  const { bprNotes } = useProductionSelection()


  return (
    <Card.Root>

      <Card.Title>{t(translations, 'stagingActionsTitle')}</Card.Title>

      <div className="grid grid-cols-1 gap-2">

        <button className="btn btn-lg btn-accent min-h-20" onClick={() => setStagingDetailsMode('add')}>
          <div className="flex gap-2 items-center">
            <TbPlus className="text-base-content text-3xl" />
            {t(translations, 'addStagedButton')}
          </div>
        </button>

        <button className="btn btn-lg btn-accent min-h-20" onClick={() => setStagingDetailsMode('note')}>
          <div className="flex gap-2 items-center">
            <TbPlus className="text-base-content text-3xl" />
            {t(translations, 'notesButton')}

          </div>
          <CircleBadge className="bg-primary/50">{bprNotes.length}</CircleBadge>
        </button>

        <CompleteStagingButton />
      </div>
    </Card.Root>
  )
}

export default DetailActions
