import SectionTitle from "@/components/Text/SectionTitle"
import { useTranslation } from "@/hooks/useTranslation"
import { useProductionSelection } from "@/store/productionSlice"
import { translations } from "../../_configs/translations"
import MaterialButton from "../shared/MaterialButton"
import Card from "@/components/Card"
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses"

const MaterialList = () => {

  const { bom } = useProductionSelection()
  const sorted = bom.sort((a, b) => parseInt(a.bom.identifier) - parseInt(b.bom.identifier));
  const filtered = bom.filter(item => item.statusId === bprBomLineStatuses.pending)
  const stagedFiltered = sorted.filter(item => item.statusId !== bprBomLineStatuses.pending);
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6 col-span-2">

      <div className="flex flex-col gap-4">
        <SectionTitle >{t(translations, "bomItemList")}</SectionTitle>
        <Card.Root>

          <div className="flex flex-col gap-6">

            {filtered.length === 0 && <p className={"text-base-content text-lg text-medium"}>{t(translations, 'noMaterialsToStage')}</p>}

            <div className="grid grid-cols-1 gap-4">
              {filtered.map(item => <MaterialButton key={item.id} material={item} />)}
            </div>
          </div>
        </Card.Root>
      </div>
      <div className="flex flex-col gap-4">
        <SectionTitle >{t(translations, "bomItemListStaged")}</SectionTitle>
        <Card.Root>
          <div className="grid grid-cols-1 gap-4">
            {stagedFiltered.map(item => <MaterialButton key={item.id} material={item} />)}
          </div>

        </Card.Root>
      </div>


    </div>
  )
}

export default MaterialList
