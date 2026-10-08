import { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { createColumnHelper } from "@tanstack/react-table"
import { TbMessageDots } from "react-icons/tb"

const columnHelper = createColumnHelper<PurchaseOrderItem>()

export const receivedColumns = [
  columnHelper.accessor('item.name', {
    header: 'Item Name',
    cell: info => {
      const row = info.row.original;
      const hasAliases = row.allAliases.length > 0;
      const supplierAlias = row.alias?.alias?.name;
      const displayName = supplierAlias ?? row.item.name;

      if (!hasAliases) return displayName;

      return (
        <div className="flex gap-1 items-center">
          {displayName}
          <div className="tooltip tooltip-info z-50">
            <div className="tooltip-content p-6 z-50">
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Aliases:</p>
                {row.allAliases.filter(a => a.name !== supplierAlias && a.name !== row.item.name).map(a => <div key={a.id}>{a.name}</div>)}
                {supplierAlias && <div>{row.item.name}</div>}
              </div>
            </div>
            <TbMessageDots className="size-6" />
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity Recieved',
    cell: info => `${toFracitonalDigits.weight(info.row.original.quantity)} ${info.row.original.uom.abbreviation}`
  }),
  columnHelper.accessor((row) => row.lot?.lotNumber ?? '', {
    id: 'lot',
    header: 'Lot',
    cell: info => <span className="font-mono">{info.getValue()}</span>
  }),
  columnHelper.accessor((row) => row.lot?.supplierLotNumber ?? '', {
    id: 'supplierLot',
    header: 'Supplier Lot',
    cell: info => <span className="font-mono">{info.getValue() || '—'}</span>
  })
]
