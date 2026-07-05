
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { IndeterminateCheckbox } from "./IndeterminateCheckbox"

type SelectableProps<TData> = {
  data: TData[],
  columns: ColumnDef<TData, any>[],
  showFooter?: boolean
  onSelectionChange?: (data: TData[]) => void,
  overflowVisible?: boolean,
}

const Selectable = <TData extends object>({ data, columns, onSelectionChange, showFooter = false, overflowVisible = false }: SelectableProps<TData>) => {

  const [rowSelection, setRowSelection] = useState({})
  const tableColumns = useMemo<ColumnDef<TData, any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <div className="">
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        </div>
      ),
    },
    ...columns
  ], [])


  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    if (onSelectionChange) {
      const selected = table.getSelectedRowModel().flatRows
      const selectedData = selected.map(s => s.original);
      onSelectionChange(selectedData);
    }
  }, [rowSelection, onSelectionChange])

  return (
    <div className={`w-full ${overflowVisible ? 'overflow-visible' : 'overflow-x-auto'}`}>
      <table className="table min-w-full text-left text-base md:text-lg font-light">
        <thead
          className="font-semibold text-xl border-accent/35 text-base-content"
        >
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}
              onClick={(e) => {
                e.stopPropagation()
                row.getToggleSelectedHandler()(row.id)
              }}
              className="hover:bg-accent/25 hover:cursor-pointer hover:text-accent-content"
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {showFooter && (
          <tfoot>
            {table.getFooterGroups().map(footerGroup => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>

    </div>
  )

}

export default Selectable
