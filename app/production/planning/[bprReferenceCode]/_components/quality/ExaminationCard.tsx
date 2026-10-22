"use client"

import { QcExamination } from "@/actions/quality/qc/records/getAll"
import Tag from "@/components/Text/Tag"
import UserIcon from "@/components/UI/UserIcon"
import { qcRecordStatuses } from "@/configs/staticRecords/qcRecordStatuses"
import { useRouter } from "next/navigation"

const ExaminationCard = ({ examination }: { examination: QcExamination }) => {
  const router = useRouter()

  const handleClick = () => {
    const isOpen = examination.status.id === qcRecordStatuses.open

    if (isOpen) {
      router.push(
        `/quality/qc/examination/new/${examination.examinedLot.lotNumber}?lotId=${examination.examinedLot.id}&examinationId=${examination.id}`
      )
    } else {
      router.push(`/quality/qc/examination/${examination.id}`)
    }
  }

  return (
    <div
      className="flex flex-col gap-4 bg-base-300/65 hover:bg-accent/55 hover:cursor-pointer rounded-xl px-4 py-4"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center w-full">
        <div className="font-semibold text-xl text-base-content">
          {examination.examinedLot.lotNumber}
        </div>

        <div className="flex gap-2 items-center">
          <div className="font-normal text-xl text-base-content">
            {examination.examinationType.name}
          </div>
          <Tag
            label={examination.status.name}
            bgColor={examination.status.bgColor}
            textColor={examination.status.textColor}
          />
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2 items-center">
          <UserIcon
            kind={examination.conductedBy.kind}
            image={examination.conductedBy.image || ""}
            name={examination.conductedBy.name || ""}
          />
          <div className="font-normal text-xl text-base-content">
            {examination.conductedBy.name || ""}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExaminationCard
