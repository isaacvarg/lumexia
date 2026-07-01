"use client";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<any>();

export const columns = [
  columnHelper.accessor("referenceCode", {
    header: SortableHeaderType("Reference Code"),
  }),
  columnHelper.accessor("producedItemName", {
    header: "Item",
    cell: (row) => {
      return row.row.original.producedItemName;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
columnHelper.accessor("bprStatusName", {
    header: "Status",
    cell: (row) => {
      return row.row.original.bprStatusName;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor("waitingOnTeam", {
    header: "Waiting On",
    cell: (row) => {
      return row.row.original.waitingOnTeam ?? "—";
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.display({
    id: "progress",
    header: "Progress",
    cell: (row) => {
      const overview = row.row.original.overview;
      if (!overview) return "—";
      return (
        <div className="flex items-center gap-2">
          <progress
            className="progress progress-success w-20"
            value={overview.completed}
            max={overview.total || 1}
          />
          <span className="text-sm text-base-content/70 shrink-0">
            {overview.completed}/{overview.total}
          </span>
        </div>
      );
    },
  }),
//  columnHelper.accessor("aliasesAll", {
//    // id: "aliases",
//    header: "Aliases",
//    cell: (row) => {
//      const count = row.row.original.aliases.length;
//      if (count > 2) {
//        return count
//      } else {
//        return row.row.original.aliasesAll;
//      }
//    },
//  }),
];
