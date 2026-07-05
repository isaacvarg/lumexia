import { Loader } from "@/components/Loading"
import { useTranslation } from "@/hooks/useTranslation"
import { useProductionActions, useProductionSelection } from "@/store/productionSlice"
import { translations } from "../../_configs/translations"
import Card from "@/components/Card"
import UserIcon from "@/components/UI/UserIcon"
import { useState } from "react"
import { handleStagingDeleteCascade } from "../../_actions/stagings/handleStagingDeleteCascade"
import { TbTrash } from "react-icons/tb"

const StagedViewMode = () => {
  const { stagings, isStagingsLoading, bpr, selectedBomItem } = useProductionSelection()
  const { t } = useTranslation()
  const { fetchStagings } = useProductionActions()
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleStagingDelete = async (stagingId: string, selectedBomItemId: string, quantity: number) => {
    if (!bpr || !selectedBomItem) return;

    try {
      setIsDeleteLoading(true)
      await handleStagingDeleteCascade(stagingId, bpr.id, selectedBomItem.bom.item.name, quantity,);
    } catch (error) {
      console.error(error)
    } finally {
      fetchStagings(selectedBomItemId);
      setIsDeleteLoading(false);
    }
  }

  return (
    <div>

      {isStagingsLoading && <Loader.Silly isLoading={isStagingsLoading} />}

      {!isStagingsLoading && stagings.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          {t(translations, 'noStagedMessage')}
        </div>
      )}

      {!isStagingsLoading && stagings.length > 0 && (
        <Card.Root>
          <Card.Title>{t(translations, 'stagedEntriesTitle')}</Card.Title>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4" >


            {stagings.map((staging) => (
              <div key={staging.id} className="flex flex-col gap-4 p-4 border border-base-content/50 rounded-md">
                <div className=" flex justify-end">
                  {isDeleteLoading && <span className="loading loading-spinner loading-md"></span>}
                  {!isDeleteLoading && <button onClick={() => handleStagingDelete(staging.id, staging.bprBomId, staging.quantity)} className="btn btn-soft btn-error">
                    <TbTrash className="size-6" />
                  </button>}
                </div>
                <div className="flex flex-row justify-between items-center ">
                  <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardLot')}</span>
                  <span className="text-base-content font-semibold text-lg">{staging.lot.lotNumber}</span>
                </div>

                <div className="flex flex-row justify-between items-center ">
                  <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardQuantity')}</span>
                  <span className="text-base-content font-semibold text-lg">{staging.quantity} {staging.uom.abbreviation}</span>
                </div>

                <div className="flex flex-row justify-between items-center ">
                  <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardBy')}</span>
                  <div className="flex gap-2">
                    <UserIcon image={staging.pulledByUser.image || ''} name={staging.pulledByUser.name || ''} />
                    <span className="text-base-content font-semibold text-lg">{staging.pulledByUser.name}</span>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center ">
                  <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardStatus')}</span>
                  <span className="text-base-content font-semibold text-lg">{staging.status.name}</span>
                </div>

              </div>
            ))}
          </div>

        </Card.Root>
      )}
    </div>


  )
}

export default StagedViewMode
