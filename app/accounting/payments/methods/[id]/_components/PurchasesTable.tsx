'use client'
import DataTable from "@/components/DataTable"
import { Panels } from "@/components/Panels"
import Text from "@/components/Text"
import { purchasesColumns } from "./PurchasesColumns"
import { PoWithAccounting } from "@/app/accounting/pos/_actions/getPoWithAccountingDetails"
import { Filter } from "@/types/filter"
import { toFacetFilter } from "@/utils/data/toFacetFilter"
import { toTableFilter } from "@/utils/data/toTableFilter"
import { useRouter } from "next/navigation"

const PurchasesTable = ({ pos }: { pos: PoWithAccounting[] }) => {
  const router = useRouter()

  const filters: Filter[] = [
    {
      columnName: "poStatus",
      filterLabel: "PO Status",
      options: toFacetFilter(pos, "status.id", "status.name"),
    },
    {
      columnName: "accountingStatus",
      filterLabel: "Accounting Status",
      options: toTableFilter(pos, (po) => po.poAccountingDetail?.status?.id, (po) => po.poAccountingDetail?.status?.name),
    },
  ]

  return (
    <Panels.Root>
      <Text.SectionTitle size="small">Purchases</Text.SectionTitle>

      <DataTable.Default
        tableStateName='paymentMethodPurchases'
        columns={purchasesColumns}
        data={pos}
        filters={filters}
        initialSortBy={[{
          id: 'referenceCode',
          desc: true,
        }]}
        onRowClick={(row) => router.push(`/accounting/pos/${row.original.referenceCode}?id=${row.original.id}`)}
      />
    </Panels.Root>
  )
}

export default PurchasesTable
