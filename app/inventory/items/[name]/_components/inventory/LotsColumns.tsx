"use client";

import { InventoryLot } from "@/actions/auxiliary/getLotsByItem";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { createColumnHelper } from "@tanstack/react-table";



const columnHelper = createColumnHelper<InventoryLot>();

export const lotsColumns = [
  columnHelper.accessor("id", {
    id: "lot",
    header: SortableHeaderType("Lot"),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: (row) => row.row.original.lotNumber
  }),
  columnHelper.accessor('supplierLotNumber', {
    header: 'Supplier Lot',
    cell: (row) => <span className="font-mono">{row.getValue() ?? ''}</span>,
  }),
  columnHelper.accessor('totalQuantityOnHand', {
    header: 'On Hand (lbs)',
    cell: (row) => toFracitonalDigits.weight(row.row.original.totalQuantityOnHand),
  }),
  columnHelper.accessor('isDepleted', {
    id: 'isDepleted',
    header: 'Is Depleted',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },

  }),
  columnHelper.accessor('lotOrigin', {
    id: 'lotOrigin',
    header: 'Origin',
    cell: (row) => {
      const origin = row.row.original.lotOrigin;
      switch (origin?.originType) {
        case 'purchaseOrderReceiving':
          return `PO #${origin.purchaseOrder?.referenceCode}`
        case 'bprProduction':
          return `BPR #${origin.bpr?.referenceCode}`
        case 'manuallyCreated':
          return 'Manually Created'
        default:
          return `Unknown`
      }
    }
  })
]
