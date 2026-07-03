import { inventoryActions } from "@/actions/inventory"
import StateSetter from "./_components/state/StateSetter"
import StepTrack from "../_components/shared/StepTrack"
import StepContainer from "./_components/shared/StepContainer"
import { qualityActions } from "@/actions/quality"
import { getResults } from "./_actions/getResults"
import HelperSetter from "@/components/Helper/HelperSetter"

type Props = {
  searchParams: {
    lotId: string
    examinationId: string
  }
}
const ExaminationConductPage = async ({ searchParams }: Props) => {

  const specimenLot = await inventoryActions.lots.getOne(searchParams.lotId);
  const record = await qualityActions.qc.records.getOne(searchParams.examinationId);

  if (!specimenLot || !record) {
    throw new Error("Specimen lot not found");
  }

  const [
    examinationTypes,
    itemParameters,
    results,
    notes,
    noteTypes,
    files,
    fileTypes,
  ] = await Promise.all([
    await qualityActions.qc.examinationTypes.getAll(),
    await qualityActions.qc.itemParameters.getByItem(specimenLot.item.id),
    await getResults(record.id),
    await qualityActions.qc.recordNotes.getAllByRecord(record.id),
    await qualityActions.qc.recordNotes.types.getAll(),
    await qualityActions.qc.recordFiles.getAll(record.id),
    await qualityActions.qc.recordFiles.types.getAll(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <StateSetter
        record={record}
        examinationTypes={examinationTypes}
        itemParameters={itemParameters}
        specimenLot={specimenLot}
        results={results}
        notes={notes}
        noteTypes={noteTypes}
        files={files}
        fileTypes={fileTypes}
      />
      <HelperSetter section="qc-conduct" />
      <StepTrack />
      <StepContainer />

    </div>
  )
}

export default ExaminationConductPage; 
