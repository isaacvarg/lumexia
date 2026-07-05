"use client";

import { Table } from "@tanstack/react-table";
import { RxCross2 } from "react-icons/rx";
import FacetedFilter from "./FacetFilter";
import { Filter } from "@/types/filter";
import DebouncedInput from "../DebouncedInput";
import useDialog from "@/hooks/useDialog";
import ActionButton from "../ActionButton";
import { useTableFilter } from "@/store/tableFilterSlice";
import { TableStateName, useTableFacets } from "@/store/tableFacetsSlice";

const classes = {
  searchBg: {
    default: 'bg-base-100',
    elevated: 'bg-base-300/65',
  }
};

export type SearchBg = keyof typeof classes.searchBg;

interface DataTableFilterbarProps<TData> {
  table: Table<TData>;
  filters?: Filter[] | null;
  dialogIdentifier?: string;
  linkPath?: string;
  actionButtonTitle?: string;
  onEnter?: (row: any) => any;
  tableStateName: TableStateName
  searchBg: SearchBg
}

export default function FilterBar<TData>({
  table,
  filters,
  dialogIdentifier,
  linkPath,
  actionButtonTitle,
  onEnter,
  tableStateName,
  searchBg = 'default',
}: DataTableFilterbarProps<TData>) {


  const { showDialog } = useDialog();
  const tableFilterState = useTableFilter()
  const tableFacetState = useTableFacets()

  const isFiltered = table.getState().columnFilters.length > 0;
  const globalFilterValue = table.getState().globalFilter ?? "";

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && table.getRowModel().rows.length === 1) {
      if (onEnter) {
        onEnter(table.getRowModel().rows[0].original);
      } else {
        console.log('not implemented yet.')
      }
    }
  };

  const handleFilterChange = (value: string | number) => {
    // set tanstack state
    table.setGlobalFilter(String(value))


    tableFilterState.setFilter(tableStateName, value as string)

  }

  const handleFacetReset = () => {
    // tanstack
    table.resetColumnFilters()

    // store
    tableFacetState.resetFilter(tableStateName)

  }


  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
        <div className={`flex ${classes.searchBg[searchBg]} w-full sm:w-auto sm:min-w-[16rem] md:min-w-[20rem] px-4 py-2 rounded-xl`}>
          <DebouncedInput
            value={globalFilterValue}
            onChange={(value) => handleFilterChange(value)}
            onKeyDown={handleEnterPress}
            placeholder="Search all"
            className='w-full focus:outline-none '
          />
          {globalFilterValue ? (
            <button
              onClick={() => handleFilterChange("")}
              className="text-base-content hover:text-accent-content"
              aria-label="Clear search"
            >
              <RxCross2 className="h-6 w-6" />
            </button>
          ) : (<div className="w-6 h-6" />)}
        </div>

        {filters && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter, index) => (
              <FacetedFilter
                key={index}
                column={table.getColumn(filter.columnName)}
                title={filter.filterLabel}
                options={filter.options}
                tableStateName={tableStateName}
              />
            ))}

            {isFiltered && (
              <button
                onClick={() => handleFacetReset()}
                className="flex items-center px-2 lg:px-3 font-poppins"
              >
                Reset
                <RxCross2 className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      {dialogIdentifier && (
        <div className="w-full md:w-auto shrink-0">
          <ActionButton
            color="neutral"
            label={actionButtonTitle ?? "Add"}
            onClick={() => showDialog(dialogIdentifier)}
          />
        </div>
      )}
    </div>
  );
}
