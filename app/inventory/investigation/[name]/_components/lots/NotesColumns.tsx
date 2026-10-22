'use client'

import { createColumnHelper } from "@tanstack/react-table"
import { DateTime } from "luxon"
import UserIcon from "@/components/UI/UserIcon"
import Tag from "@/components/Text/Tag"
import { LotNote } from "@/actions/inventory/lots/notes/getAllByLot"

const columnHelper = createColumnHelper<LotNote>()

export const lotNotesColumns = [
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat("DD @t")
  }),
  columnHelper.accessor('noteType.name', {
    header: "Type",
    cell: (row) => {
      const noteType = row.row.original.noteType
      return <Tag label={noteType.name} bgColor={noteType.bgColor} textColor={noteType.textColor} />
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
  }),
]
