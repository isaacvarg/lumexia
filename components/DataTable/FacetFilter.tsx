import React from "react";
import { Column } from "@tanstack/react-table";
import * as Popover from "@radix-ui/react-popover";
import * as Separator from "@radix-ui/react-separator";

import { RxCheck, RxPlus } from "react-icons/rx";
import { FacetOptions } from "@/types/facetOption";
import { sortByProperty } from "@/utils/data/sortByProperty";
import { TableStateName, useTableFacets } from "@/store/tableFacetsSlice";
import { TableFilterOption } from "@/utils/data/toTableFilter";

interface DataTableFacetedFilter<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: FacetOptions[] | TableFilterOption[];
  tableStateName: TableStateName;
}

export default function FacetedFilter<TData, TValue>({
  column,
  title,
  options,
  tableStateName,
}: DataTableFacetedFilter<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const tableFacets = useTableFacets()

  const [query, setQuery] = React.useState("");

  const sortedOptions = sortByProperty(options, "label");

  const filteredOptions = query
    ? sortedOptions.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      )
    : sortedOptions;


  const handleClick = (isSelected: boolean, option: FacetOptions) => {
    if (!column) { return }

    const filterName = column.id;
    const filterValue = option.value

    if (isSelected) {
      //for zunstand state
      tableFacets.removeValueFromFilter(tableStateName, filterName, filterValue)

      // for tanstack
      selectedValues.delete(option.value as string);
    } else {
      //state
      tableFacets.addToFilter(tableStateName, filterName, filterValue)

      // tanstack
      selectedValues.add(option.value as string);
    }

    const filterValues = Array.from(selectedValues);
    column?.setFilterValue(
      filterValues.length ? filterValues : undefined
    );

  }


  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center text-normal font-poppins font-medium px-2 py-2 border-2 border-dotted border-accent/35 rounded-lg">
          <RxPlus className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator.Root
                className="bg-accent mx-2 w-px h-6"
                orientation="vertical"
              />
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <span className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </span>
                ) : (
                  sortedOptions
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <span
                        key={option.value}
                        className=" bg-accent px-2 font-normal rounded-lg"
                      >
                        {option.label.length > 20 ? `${option.label.slice(0, 20)}...` : option.label}
                      </span>
                    ))
                )}
              </div>
            </>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="flex flex-col rounded-xl bg-base-100 border border-base-300 shadow-lg z-50 p-1"
          collisionPadding={8}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title ?? ""}`.trim()}
            className="input input-sm input-bordered w-full mb-1"
          />
          <div className="flex flex-col gap-y-1 max-h-[var(--radix-popover-content-available-height)] overflow-auto">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.has(option.value);
              return (
                <button
                  className="font-inter text-lg text-base-content px-2 py-1 bg-base-200 hover:bg-base-300 rounded-lg"
                  key={option.value}
                  onClick={() => handleClick(isSelected, option)}
                >
                  <div className="flex flex-row items-center ">
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-lg border border-accent" ${isSelected
                        ? "bg-accent text-accent-content"
                        : "bg-accent opacity-50 [&_svg]:invisible"
                        }`}
                    >
                      <RxCheck />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-accent-content" />
                    )}
                    <span>  {option.label.length > 25 ? `${option.label.slice(0, 25)}...` : option.label}
                    </span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-inter text-lg">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <Popover.Close />
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
