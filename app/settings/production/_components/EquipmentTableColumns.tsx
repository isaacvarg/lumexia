"use client";

import { Equipment } from "@/actions/facility/equipment/getAllEquipment";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { createColumnHelper } from "@tanstack/react-table";



const columnHelper = createColumnHelper<Equipment>();

export const EquipmentTableColumns = [
    columnHelper.accessor("name", {
        header: SortableHeaderType("Equipment Name"),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
columnHelper.accessor("identifier", {
        header: SortableHeaderType("Identifier"),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor("equipmentType.id", {
        id: 'equipmentType.id',
        header: SortableHeaderType("Type"),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
        cell: (row) => {
            return row.row.original.equipmentType.name
        }

    })
]
