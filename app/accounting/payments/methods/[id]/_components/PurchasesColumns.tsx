import { createColumnHelper } from "@tanstack/react-table";
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { PoWithAccounting } from "@/app/accounting/pos/_actions/getPoWithAccountingDetails";
import Tag from "@/components/Text/Tag";
import { FilterFunction } from "@/components/DataTable/FilterFunction";

const columnHelper = createColumnHelper<PoWithAccounting>();

export const purchasesColumns = [
  columnHelper.accessor("referenceCode", {
    header: "#",
  }),
  columnHelper.accessor("supplier.id", {
    id: 'supplier',
    header: 'Supplier',
    cell: (row) => row.row.original.supplier.name,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor("total", {
    header: 'Total ($)',
    cell: (row) => toFracitonalDigits.curreny(row.row.original.total),
  }),
  columnHelper.accessor("status.id", {
    id: 'poStatus',
    header: "PO Status",
    cell: (row) => {
      const status = row.row.original.status
      return <Tag bgColor={status.bgColor} textColor={status.textColor} label={status.name} />
    },
    filterFn: FilterFunction,
  }),
  columnHelper.accessor("poAccountingDetail.status.id", {
    id: 'accountingStatus',
    header: "Accounting Status",
    cell: (row) => {
      const details = row.row.original.poAccountingDetail
      if (details && details.status) {
        const status = details.status
        return <Tag bgColor={status.bgColor} textColor={status.textColor} label={status.name} tooltip={status?.description || ''} />
      }

      return <Tag color="default" label="No Data" tooltip="This PO has no accounting data associated with it." />
    },
    filterFn: FilterFunction,
  }),
]
