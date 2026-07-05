'use client'

import { InvestigationLot } from "../../_actions/getInvestigationData"
import Text from "@/components/Text"
import { transactionsColumns } from "./TransactionsColumns"
import { lotNotesColumns } from "./NotesColumns"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

const MiniTable = ({ data, columns, emptyMessage }: { data: any[], columns: any[], emptyMessage: string }) => {

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (data.length === 0) {
    return <p className="text-base-content/50 italic">{emptyMessage}</p>
  }

  return (
    <div className="w-full overflow-x-auto"><table className="min-w-full text-left text-sm font-light">
      <thead className="border-b font-medium border-accent/35 text-base-content">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="py-2 px-2">
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-accent/15">
            {row.getVisibleCells().map((cell) => (
              <td className="py-2 px-2 text-base-content" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table></div>
  )
}

const LotExpandedRow = ({ lot }: { lot: InvestigationLot }) => {
  return (
    <div className="flex flex-col gap-y-6 p-4 bg-base-200 rounded-lg">
      <div>
        <Text.SectionTitle size="small">Transactions ({lot.transactions.length})</Text.SectionTitle>
        <MiniTable
          data={lot.transactions}
          columns={transactionsColumns}
          emptyMessage="No transactions for this lot."
        />
      </div>
      <div>
        <Text.SectionTitle size="small">Lot Notes ({lot.lotNotes.length})</Text.SectionTitle>
        <MiniTable
          data={lot.lotNotes}
          columns={lotNotesColumns}
          emptyMessage="No notes for this lot."
        />
      </div>
    </div>
  )
}

export default LotExpandedRow
