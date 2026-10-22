"use client";

import { CompletedAudit } from "@/actions/inventory/auditRequests/getAllCompleted";
import UserIcon from "@/components/UI/UserIcon";
import { dateFormatString } from "@/configs/data/dateFormatString";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";



const columnHelper = createColumnHelper<CompletedAudit>();

export const auditColumns = [
    columnHelper.accessor("item.id", {
        id: "item",
        header: "Item",
        cell: (row) => row.row.original.item.name,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },

    }),
    columnHelper.accessor("requestById", {
        id: "requester",
        header: "Requester",
        cell: (row) => <UserIcon kind={row.row.original.requestedBy.kind} name={row.row.original.requestedBy.name || ''} image={row.row.original.requestedBy.image || ''} />,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },

    }),
    columnHelper.accessor('inventoryAudit.user.id', {
        header: "Conductee",
        id: 'conductee',
        cell: (row) => <UserIcon kind={row.row.original.inventoryAudit?.user.kind} name={row.row.original.inventoryAudit?.user.name || ''} image={row.row.original.inventoryAudit?.user.image || ''} />,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    }),
    columnHelper.accessor('inventoryAudit.createdAt', {
        header: 'Audit Timestamp',
        cell: (row) => {
            if (!row.row.original.inventoryAudit) return;
            const conductedTimestamp = row.row.original.inventoryAudit.createdAt
            return DateTime.fromJSDate(conductedTimestamp).toFormat(dateFormatString)
        }
    })
]
