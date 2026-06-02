import { InventoryLot } from "@/actions/auxiliary/getLotsByItem"
import { qualityActions } from "@/actions/quality"
import { getUserId } from "@/actions/users/getUserId"
import Dialog from "@/components/Dialog"
import Searcher from "@/components/Search/Searcher"
import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes"
import { qcRecordStatuses } from "@/configs/staticRecords/qcRecordStatuses"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export const newExaminationDialog = "newExamination"

const NewExamination = () => {

  const { inventory } = useItemSelection()
  const { resetDialogContext } = useDialog()
  const router = useRouter()

  // show newest lots first so the default (untyped) results lead with the latest
  const lots = useMemo(
    () =>
      [...(inventory?.lots ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [inventory?.lots]
  )

  const [filtered, setFiltered] = useState<InventoryLot[]>(lots)

  const handleClick = async (lot: InventoryLot) => {
    const userId = await getUserId()
    const record = await qualityActions.qc.records.create({
      conductedById: userId,
      examinedLotId: lot.id,
      examinationTypeId: qcExaminationTypes.inProcess,
      statusId: qcRecordStatuses.open,
    })

    resetDialogContext()
    router.push(`/quality/qc/examination/new/${lot.lotNumber}?lotId=${lot.id}&examinationId=${record.id}`)
  }

  return (
    <Dialog.Root identifier={newExaminationDialog}>
      <Dialog.Title>New Examination</Dialog.Title>

      <div className="flex flex-col gap-4">
        <Searcher<InventoryLot>
          keys={['lotNumber']}
          data={lots}
          onQueryComplete={setFiltered}
        />

        <div className="grid grid-cols-1 gap-1">
          {filtered.slice(0, 5).map(lot => {
            return (
              <div
                key={lot.id}
                className="flex justify-between items-center px-4 py-2 font-medium text-lg text-base-content bg-accent/25 hover:cursor-pointer hover:bg-accent/20"
                onClick={() => handleClick(lot)}
              >
                <span>{lot.lotNumber}</span>
                <span className="text-sm font-normal opacity-70">
                  {DateTime.fromJSDate(new Date(lot.createdAt)).toFormat('DDD')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Dialog.Root>
  )
}

export default NewExamination
