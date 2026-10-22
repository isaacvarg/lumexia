"use client";

import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { createColumnHelper } from "@tanstack/react-table";
import { LotTransaction } from "../../_actions/inventory/getTransactionsByLot";
import { DateTime } from "luxon";
import UserIcon from "@/components/UI/UserIcon";
import { transactionTypes } from "@/configs/staticRecords/transactionTypes";


const { adjustmentAddition, adjustmentRemoval, bprConsumption } = transactionTypes

const columnHelper = createColumnHelper<LotTransaction>();

export const transactionColumns = [
  columnHelper.accessor("createdAt", {
    header: SortableHeaderType("Timestamp"),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat("ccc, LLL dd yyyy @t")
  }),
  columnHelper.accessor('amount', {
    header: "Quantity (lbs)",
    cell: (row) => toFracitonalDigits.weight(row.row.original.amount)
  }),
  columnHelper.accessor('transactionType.id', {
    id: 'type',
    header: "Type",
    cell: (row) => {
      const type = row.row.original.transactionTypeId;
      switch (type) {
        case adjustmentAddition:
          return <div className="badge badge-success badge-md">Addition</div>
        case adjustmentRemoval:
          return <div className="badge badge-error badge-md">Removal</div>
        case bprConsumption:
          return <div className="badge badge-warning badge-md">BPR Consumption</div>
        default:
          console.error('Transaction Type case not found')
          break;
      }
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },

  }),
  columnHelper.accessor('user.id', {
    id: 'user',
    header: 'Conducted By',
    cell: (row) => {
      const user = row.row.original.user;

      return (<div className="flex  gap-x-2">
        <UserIcon kind={user.kind} image={user.image || ''} name={user.name || ''} />
        <p>{user.name}</p>
      </div>)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },

  }),
  columnHelper.accessor('systemNote', {
    header: 'Note',
    cell: (row) => {

      if (row.row.original.transactionTypeId === bprConsumption) {
        if (!row.row.original.bprStagingConsumption) {
          return 'Consumption of Legacy BPR Not Linked.'
        }
        const bpr = row.row.original.bprStagingConsumption?.bprStaging.bprBom.bpr
        return `BRR #${bpr?.referenceCode} - ${bpr?.mbpr.producesItem.name}`
      }

      return row.row.original.systemNote
    }
  })

]



