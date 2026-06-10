"use client";
import { Mbpr } from "@/actions/production/getAllMbprs";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { dateFormatString } from "@/configs/data/dateFormatString";
import { TextUtils } from "@/utils/text";
import { createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";

const classes = {
    color: {
        active: 'bg-success text-success-content',
        archived: 'bg-error text-error-content',
    }
}

const columnHelper = createColumnHelper<Mbpr>();

export const MbprColumns = [
    columnHelper.accessor("producesItem.name", {
        id: "producesItemId",
        header: SortableHeaderType("Produced Item"),
        cell: (row) => {
            return row.row.original.producesItem.name
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor("versionLabel", {
        header: SortableHeaderType("Version Label"),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor("recordStatus.id", {
        id: "recordStatus.id",
        header: SortableHeaderType("Status"),
        cell: (row) => {
            const statusName = row.row.original.recordStatus.name as keyof typeof classes.color
            return <p className={`${classes.color[statusName]} px-4 py-1 text-center rounded-xl`} >{TextUtils.properCase(row.row.original.recordStatus.name)}</p>
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor("updatedAt", {
        cell: (row) => {
            return DateTime.fromJSDate(row.row.original.createdAt).toFormat(dateFormatString);
        },
        header: SortableHeaderType("Updated"),
    }),
]
