import { QcRecordExpanded } from "@/actions/quality/qc/records/getAllByItem"
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import Tag from "@/components/Text/Tag"
import UserIcon from "@/components/UI/UserIcon"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"
import { qcRecordStatuses } from "@/configs/staticRecords/qcRecordStatuses"
import { useItemSelection } from "@/store/itemSlice"
import useDialog from "@/hooks/useDialog"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbCalendar, TbX } from "react-icons/tb"
import Import from "./Import"
import NewExamination, { newExaminationDialog } from "./NewExamination"

const Examinations = () => {

  const { qcRecords, item } = useItemSelection()
  const { showDialog } = useDialog()
  const router = useRouter()
  const [isImport, setIsImport] = useState(false);
  const handleClick = (record: QcRecordExpanded) => {
    const isOpen = record.status.id === qcRecordStatuses.open

    if (isOpen) {
      const path = `/quality/qc/examination/new/${record.examinedLot.lotNumber}?lotId=${record.examinedLot.id}&examinationId=${record.id}`
      router.push(path)
    } else {
      router.push(`/quality/qc/examination/${record.id}`)
    }
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SectionTitle>Examinations</SectionTitle>
        <div className="flex gap-2">
          {isImport
            ? <button onClick={() => setIsImport(false)} className='btn btn-error'><TbX className="size-4" /></button>
            : <button onClick={() => setIsImport(true)} className='btn btn-primary'>Import</button>
          }
          {!isImport && (
            <>
              <button
                onClick={() => router.push(`/quality/qc/examination/bulk-entry/${item?.name}`)}
                className='btn btn-secondary'
              >
                Bulk Entry
              </button>
              <button
                onClick={() => showDialog(newExaminationDialog)}
                className='btn btn-primary'
              >
                New Examination
              </button>
            </>
          )}
        </div>
      </div>

      <NewExamination />

      {isImport && <Import />}

      {!isImport && (<Card.Root>
        {qcRecords.map(record => {
          return (
            <div
              key={record.id}
              className="flex flex-col gap-4 bg-base-300/65 hover:bg-accent/55 hover:cursor-pointer rounded-xl px-4 py-4  items-center"
              onClick={() => handleClick(record)}
            >

              <div className="flex justify-between items-center w-full">
                <div className="font-semibold text-xl text-base-content">
                  {record.examinedLot.lotNumber}
                </div>

                <div className=" flex gap-2 items-center">
                  <div className="font-normal text-xl text-base-content">
                    {record.examinationType.name}
                  </div>
                  <Tag label={record.status.name} bgColor={record.status.bgColor} textColor={record.status.textColor} />
                </div>
              </div>

              <div className="flex justify-between items-center w-full">
                <div className=" flex gap-2 items-center">
                  <UserIcon image={record.conductedBy.image || ''} name={record.conductedBy.name || ''} />
                  <div className="font-normal text-xl text-base-content">{record.conductedBy.name || ''}</div>
                </div>

                <div className=" flex gap-2 items-center">
                  <TbCalendar className="size-4" />
                  <div className="font-normal text-xl text-base-content">{DateTime.fromJSDate(record.createdAt || '').toFormat(dateFormatWithTime)}</div>
                </div>
              </div>



            </div>


          )
        })}
      </Card.Root>
      )}
    </div>
  )
}

export default Examinations
