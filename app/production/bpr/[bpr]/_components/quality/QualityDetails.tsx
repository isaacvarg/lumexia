import SectionTitle from "@/components/Text/SectionTitle"
import { useProductionSelection } from "@/store/productionSlice"
import Amounts from "../shared/Amounts"
import StagedQualityCard from "./StagedQualityCard"
import QualityActions from "./QualityActions"
import { Fragment } from "react"
import Notes from "../shared/Notes"

const QualityDetails = () => {
  const { selectedBomItem, stagings, qualityDetailsViewMode } = useProductionSelection()

  if (!selectedBomItem) return false

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3" >
      <div className="flex flex-col gap-6">

        {qualityDetailsViewMode === 'main' && (
          <Fragment>
            <QualityActions />
            <Amounts />
            {stagings.map(s => {
              return (
                <StagedQualityCard key={s.id} staged={s} />
              )
            })}

            <QualityActions />
          </Fragment>
        )}

        {qualityDetailsViewMode === 'note' && (
          <Notes />
        )}



      </div>

    </div>
  )
}

export default QualityDetails
