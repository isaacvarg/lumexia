import UserIcon from "@/components/UI/UserIcon"
import { BprStagingItem } from "../../_actions/getBprStagings"
import { translations } from "../../_configs/translations"
import { useTranslation } from "@/hooks/useTranslation"
import { TbCheck, TbX } from "react-icons/tb"
import { Fragment, useState } from "react"
import { useProductionActions, useProductionSelection } from "@/store/productionSlice"
import { handleSingleStagingApproval } from "../../_actions/quality/handleSingleStagingApproval"
import { handleSingleStagingDeny } from "../../_actions/quality/handleSingleStagingDeny"



const StagedQualityCard = ({ staged }: { staged: BprStagingItem }) => {
  const { t } = useTranslation()
  const [isDeny, setIsDeny] = useState<boolean>(false);
  const [denyNote, setDenyNote] = useState<string>('');
  const { bpr, selectedBomItem, qualityMode } = useProductionSelection()
  const { fetchStagings } = useProductionActions()
  const isApproved = (qualityMode === 'primary' && staged.status.sequence >= 2) || (qualityMode === 'secondary' && staged.status.sequence >= 3)

  const handleApprove = async () => {

    if (!bpr || !selectedBomItem || !qualityMode) return;
    await handleSingleStagingApproval(qualityMode, staged, bpr.id, selectedBomItem.bom.item.name)
    fetchStagings(selectedBomItem.id)
  }

  const handelDeny = () => {
    setIsDeny(true);
  }

  const handleDenySubmit = async () => {

    if (!bpr || !selectedBomItem || !qualityMode) return;
    handleSingleStagingDeny(qualityMode, denyNote, staged, bpr.id, selectedBomItem.bom.item.name)
    fetchStagings(selectedBomItem.id)
    setIsDeny(false)
  }

  if (isApproved) {
    return (
      <div className="flex flex-col gap-2 p-8 rounded-xl bg-success/50 shadow-xl">

        <div className="flex justify-center gap-4 items-center">
          <TbCheck className="size-12" />
          <h1 className="text-3xl text-success-content font-poppins font-semibold">Verified</h1>
        </div>

        <div className="flex flex-row justify-between items-center ">



          <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardLot')}</span>
          <span className="text-base-content font-semibold text-lg">{staged.lot.lotNumber}</span>
        </div>

        <div className="flex flex-row justify-between items-center ">
          <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardQuantity')}</span>
          <span className="text-base-content font-semibold text-lg">{staged.quantity} {staged.uom.abbreviation}</span>
        </div>

      </div >
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8 rounded-xl bg-base-100 shadow-xl">

      {!isDeny && (
        <Fragment>
          <div className="flex flex-row justify-between items-center ">

            <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardLot')}</span>
            <span className="text-base-content font-semibold text-lg">{staged.lot.lotNumber}</span>
          </div>

          <div className="flex flex-row justify-between items-center ">
            <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardQuantity')}</span>
            <span className="text-base-content font-semibold text-lg">{staged.quantity} {staged.uom.abbreviation}</span>
          </div>

          <div className="flex flex-row justify-between items-center ">
            <span className="text-base-content/50 font-semibold text-lg">{t(translations, 'stagedCardBy')}</span>
            <div className="flex gap-2">
              <UserIcon image={staged.pulledByUser.image || ''} name={staged.pulledByUser.name || ''} />
              <span className="text-base-content font-semibold text-lg">{staged.pulledByUser.name}</span>
            </div>
          </div>



          <div className="flex flex-row overflow-x-auto gap-4 p-6 border-dashed border-2 border-base-content/10 rounded-xl items-center justify-center">
            {staged.files.map(image => {
              return (
                <a key={image.fileId} href={image.file.url} target="_blank" rel="noopener noreferrer" className="hover:cursor-pointer">
                  <img className="size-80 rounded-xl object-cover" src={image.file.url} />
                </a>

              )
            })}

          </div>

          <div className="grid grid-cols-2 gap-6">
            <button onClick={handleApprove} className="btn btn-success min-h-28">
              <TbCheck className="size-8 text-success-content" />

            </button>

            <button className="btn btn-warning min-h-28" onClick={handelDeny}>
              <TbX className="size-8 text-warning-content" />

            </button>

          </div>
        </Fragment>
      )}

      {isDeny && (
        <div className="flex flex-col gap-4">
          <label className="font-poppins text-lg text-error-content">Add Note For Denial</label>
          <input type="text" className="textarea textarea-error w-full h-full" value={denyNote} onChange={(e) => setDenyNote(e.target.value)} />
          <button className="btn btn-error btn-xl" onClick={handleDenySubmit}>Deny</button>
        </div>
      )}


    </div>


  )
}

export default StagedQualityCard
