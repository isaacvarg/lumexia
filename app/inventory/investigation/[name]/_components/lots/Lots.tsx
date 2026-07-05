'use client'

import { useInvestigationSelection } from "@/store/investigationSlice"
import { lotsColumns } from "./LotsColumns"
import LotExpandedRow from "./LotExpandedRow"
import Text from "@/components/Text"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  Updater,
  FilterFn,
} from "@tanstack/react-table"
import { useState } from "react"
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi"
import { useTableFilter } from "@/store/tableFilterSlice"
import { useTablePagination } from "@/store/tablePaginationSlice"

const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const search = String(filterValue).toLowerCase()
  const searchInObject = (obj: any): boolean => {
    if (obj === null || obj === undefined) return false
    if (Array.isArray(obj)) return obj.some(searchInObject)
    if (typeof obj === 'object') return Object.values(obj).some(searchInObject)
    return String(obj).toLowerCase().includes(search)
  }
  return searchInObject(row.original)
}

const Lots = () => {

  const { lots } = useInvestigationSelection()
  const tableFilterState = useTableFilter()
  const tablePaginationSlice = useTablePagination()

  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState(tableFilterState['investigationLots'] ?? "")
  const [pagination, setPagination] = useState<PaginationState>(tablePaginationSlice['investigationLots'] || { pageIndex: 0, pageSize: 50 })

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newValue = updater instanceof Function ? updater(pagination) : updater
    setPagination(newValue)
    tablePaginationSlice.setPagination('investigationLots', newValue)
  }

  const table = useReactTable({
    data: lots,
    columns: lotsColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    globalFilterFn,
    getRowCanExpand: () => true,
  })

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <Text.SectionTitle>Lots ({lots.length})</Text.SectionTitle>
        <input
          type="text"
          placeholder="Search lots..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value)
            tableFilterState.setFilter('investigationLots', e.target.value)
          }}
          className="input input-bordered w-80"
        />
      </div>

      <div className="w-full">
        <div className="w-full overflow-x-auto"><table className="min-w-full text-left text-lg font-light">
          <thead className="border-b font-medium border-accent/35 text-base-content">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="px-2" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <>
                <tr
                  key={row.id}
                  onClick={() => row.toggleExpanded()}
                  className="border-b border-accent/35 hover:bg-accent/25 hover:cursor-pointer hover:text-accent-content"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td className="py-4 px-2 text-base-content" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr key={`${row.id}-expanded`}>
                    <td colSpan={row.getVisibleCells().length} className="p-0">
                      <LotExpandedRow lot={row.original} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table></div>

        <div className="flex flex-col gap-4 mt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="flex text-base-content font-inter font-semibold items-center gap-1">
              Jump To Page:
              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  table.setPageIndex(page)
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className="border border-accent/35 bg-base-100 p-2 rounded w-16"
              />
            </span>
          </div>
          <div className="flex items-center gap-x-2 md:gap-x-4 text-xl md:text-3xl">
            <button className="py-1 px-2 rounded-lg text-2xl text-accent-content bg-accent/35 disabled:opacity-40 font-inter font-semibold hover:bg-accent" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <FiChevronsLeft />
            </button>
            <button className="py-1 px-2 rounded-lg text-2xl text-accent-content bg-accent/35 disabled:opacity-40 font-inter font-semibold hover:bg-accent" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <FiChevronLeft />
            </button>
            <span className="flex items-center gap-1 font-inter font-semibold text-base-content text-base">
              <div>Page</div>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount().toLocaleString()}
            </span>
            <button className="py-1 px-2 rounded-lg text-2xl text-base-content bg-accent/35 disabled:opacity-40 font-inter font-semibold hover:bg-accent" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <FiChevronRight />
            </button>
            <button className="py-1 px-2 rounded-lg text-2xl text-base-content bg-accent/35 disabled:opacity-40 font-inter font-semibold hover:bg-accent" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <FiChevronsRight />
            </button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-accent/35 hover:bg-accent/15 rounded-lg px-2 py-1 font-inter text-base text-accent-content font-semibold w-32"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize} className="font-inter text-base text-base-content font-semibold">
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default Lots
