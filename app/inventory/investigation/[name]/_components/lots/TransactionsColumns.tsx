'use client'

import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { createColumnHelper } from "@tanstack/react-table"
import { DateTime } from "luxon"
import UserIcon from "@/components/UI/UserIcon"
import { InvestigationLot } from "../../_actions/getInvestigationData"

type LotTransaction = InvestigationLot['transactions'][number]

const columnHelper = createColumnHelper<LotTransaction>()

export const transactionsColumns = [
  columnHelper.accessor("createdAt", {
    header: SortableHeaderType("Timestamp"),
    cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat("ccc, LLL dd yyyy @t")
  }),
  columnHelper.accessor('amount', {
    header: "Quantity",
    cell: (row) => toFracitonalDigits.weight(row.row.original.amount)
  }),
  columnHelper.accessor('transactionType.name', {
    id: 'type',
    header: "Type",
    cell: (row) => {
      const deduction = row.row.original.transactionType.deduction
      return (
        <div className={`badge badge-md ${deduction ? 'badge-error' : 'badge-success'}`}>
          {row.row.original.transactionType.name}
        </div>
      )
    },
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
  columnHelper.accessor('systemNote', {
    header: 'System Note',
  }),
  columnHelper.accessor('userNote', {
    header: 'User Note',
  }),
]
