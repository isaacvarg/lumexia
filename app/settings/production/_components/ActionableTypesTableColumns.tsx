"use client";

import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { createColumnHelper } from "@tanstack/react-table";
import { ActionableTypeRow } from "../_actions/getActionableTypes";

const columnHelper = createColumnHelper<ActionableTypeRow>();

export const ActionableTypesTableColumns = [
  columnHelper.accessor("name", {
    header: SortableHeaderType("Name"),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor("dataType", {
    header: SortableHeaderType("Data Type"),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor("userRole.name", {
    id: "userRole.name",
    header: SortableHeaderType("Role"),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    cell: (row) => row.row.original.userRole.name,
  }),
  columnHelper.accessor("description", {
    header: SortableHeaderType("Description"),
    cell: (row) => row.row.original.description ?? '',
  }),
];
