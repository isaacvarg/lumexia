'use client'
import PageTitle from "@/components/Text/PageTitle"
import { useItemSelection } from "@/store/itemSlice"
import ActionButtons from "./ActionButtons"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"

const TitleRow = () => {

  const { item } = useItemSelection()

  if (!item) return <Skeleton />

  const isArchived = item.recordStatusId === recordStatuses.archived;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">

      <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
        <PageTitle>{item.name}</PageTitle>

        {isArchived && <div className="flex items-center justify-center font-poppins text-4xl font-black animate-pulse text-error">Archived Item</div>}
      </div>

      <ActionButtons />

    </div>
  )
}

export default TitleRow

// skeleton

const Skeleton = () => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
      <div className="skeleton w-full max-w-[400px] h-8" ></div>

      <div className="flex flex-wrap gap-2">

        <div className="skeleton w-40 h-8" />
        <div className="skeleton w-40 h-8" />
      </div>

    </div>
  )
}
