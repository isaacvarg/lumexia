'use client'

import { useInvestigationSelection } from "@/store/investigationSlice"
import DataTable from "@/components/DataTable/Default"
import Text from "@/components/Text"
import { createColumnHelper } from "@tanstack/react-table"
import { DateTime } from "luxon"
import UserIcon from "@/components/UI/UserIcon"
import Tag from "@/components/Text/Tag"
import { ItemNote } from "@/actions/inventory/items/notes/getAllByItem"

const columnHelper = createColumnHelper<ItemNote>()

const itemNotesColumns = [
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat("DD @t")
  }),
  columnHelper.accessor('noteType.name', {
    id: 'noteType',
    header: "Type",
    cell: (row) => {
      const noteType = row.row.original.noteType
      return <Tag label={noteType.name} bgColor={noteType.bgColor} textColor={noteType.textColor} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }),
  columnHelper.accessor('content', {
    header: 'Content',
  }),
  columnHelper.accessor('user.id', {
    id: 'user',
    header: 'User',
    cell: (row) => {
      const user = row.row.original.user
      return (
        <div className="flex gap-x-2">
          <UserIcon kind={user.kind} image={user.image || ''} name={user.name || ''} />
          <p>{user.name}</p>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }),
]

const Notes = () => {

  const { notes } = useInvestigationSelection()

  return (
    <div className="flex flex-col gap-y-6">
      <Text.SectionTitle>Item Notes ({notes.length})</Text.SectionTitle>
      <DataTable
        data={notes}
        columns={itemNotesColumns}
        onRowClick={() => { }}
        tableStateName="investigationNotes"
        initialSortBy={[{ id: 'createdAt', desc: true }]}
      />
    </div>
  )
}

export default Notes
