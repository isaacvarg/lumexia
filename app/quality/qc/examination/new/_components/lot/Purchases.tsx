import { Lot } from "@/actions/inventory/lots/getAll";
import { qualityActions } from "@/actions/quality";
import { getUserId } from "@/actions/users/getUserId";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes";
import { qcRecordStatuses } from "@/configs/staticRecords/qcRecordStatuses";
import { useQcExaminationSelection } from "@/store/qcExaminationSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Purchases = () => {

  const { lots } = useQcExaminationSelection()
  const [latest, setLatest] = useState<Lot[]>([])
  const router = useRouter()

  const handleClick = async (lot: Lot) => {

    const userId = await getUserId()
    const record = await qualityActions.qc.records.create({
      conductedById: userId,
      examinedLotId: lot.id,
      examinationTypeId: qcExaminationTypes.inProcess,
      statusId: qcRecordStatuses.open,
    })

    const path = `/quality/qc/examination/new/${lot.lotNumber}?lotId=${lot.id}&examinationId=${record.id}`
    router.push(path)
  }

  useEffect(() => {

    if (lots.length === 0) return;

    const batches = lots.filter(l => {
      if (!l.lotOrigin) return false
      return l.lotOrigin.originType === 'purchaseOrderReceiving'
    }).slice(0, 20);


    setLatest(batches);


  }, [lots])

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Latest Purchases</SectionTitle>

      <Card.Root>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {latest.map(l => {
            return (
              <button
                className="p-6 flex flex-col rounded-xl bg-secondary/30 hover:bg-secondary/15 hover:cursor-pointer"
                key={l.id}
                onClick={() => handleClick(l)}
              >
                <h1 className="font-poppins text-md font-medium">{l.item.name}</h1>
                <h1 className="font-poppins text-md font-medium">{l.lotNumber}</h1>
                <h1 className="font-poppins text-md font-medium">PO #{l.purchaseOrderNumber}</h1>

              </button>
            )
          })}

        </div>
      </Card.Root>


    </div >
  )
}

export default Purchases 
