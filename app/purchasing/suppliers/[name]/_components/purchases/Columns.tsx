"use client";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import Tag from "@/components/Text/Tag";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";

const columnHelper = createColumnHelper<any>();

export const purchasesColumns = [
    columnHelper.accessor("referenceCode", {
        header: SortableHeaderType("PO #"),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor("status.id", {
        id: "status",
        header: SortableHeaderType("Status"),
        cell: (row) => {
            const { name, bgColor, textColor } = row.row.original.status;
            return <Tag label={name} bgColor={bgColor} textColor={textColor} />;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor((row) => row.poAccountingDetail?.paymentMethod?.id, {
        id: "paymentMethod",
        header: SortableHeaderType("Payment Method"),
        cell: (row) => row.row.original.poAccountingDetail?.paymentMethod?.methodName ?? "—",
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor("total", {
        header: SortableHeaderType("Total ($)"),
        cell: (row) => {
            return toFracitonalDigits.curreny(row.row.original.total);
        },
    }),
    columnHelper.accessor("lineItems", {
        id: "itemCount",
        header: SortableHeaderType("Items"),
        cell: (row) => {
            return row.row.original.lineItems?.length ?? 0;
        },
        sortingFn: (rowA, rowB) => {
            const a = rowA.original.lineItems?.length ?? 0;
            const b = rowB.original.lineItems?.length ?? 0;
            return a - b;
        },
    }),
    columnHelper.accessor("createdAt", {
        header: SortableHeaderType("Created"),
        cell: (row) => {
            return DateTime.fromJSDate(row.row.original.createdAt).toFormat("DD @ t");
        },
    }),
    columnHelper.accessor("updatedAt", {
        header: SortableHeaderType("Updated"),
        cell: (row) => {
            return DateTime.fromJSDate(row.row.original.updatedAt).toFormat("DD @ t");
        },
    }),
];
