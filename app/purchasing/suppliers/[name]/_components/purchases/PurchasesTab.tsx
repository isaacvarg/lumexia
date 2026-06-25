"use client";

import DataTable from "@/components/DataTable";
import { purchasesColumns } from "./Columns";
import TotalMetrics from "./TotalMetrics";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import {
  RowSelectionHandlerMethod,
  rowSelectionHandler,
} from "@/utils/auxiliary/rowSelectionHandler";
import { useRouter } from "next/navigation";
import { useSupplierDetailSelection } from "@/store/supplierDetailSlice";
import { toFacetFilter } from "@/utils/data/toFacetFilter";
import { Filter } from "@/types/filter";

const PurchasesTab = () => {
  const { purchases } = useSupplierDetailSelection();
  const router = useRouter();

  const handleClick = (row: any, method: RowSelectionHandlerMethod) => {
    const path = `/purchasing/purchase-orders/${row.original.referenceCode}?id=${row.original.id}`;
    rowSelectionHandler(method, path, router);
  };

  const filters: Filter[] = [
    {
      columnName: "status",
      filterLabel: "Status",
      options: toFacetFilter(purchases, "status.id", "status.name"),
    },
    {
      columnName: "paymentMethod",
      filterLabel: "Payment Method",
      options: toFacetFilter(
        purchases.filter((p: any) => p.poAccountingDetail?.paymentMethod),
        "poAccountingDetail.paymentMethod.id",
        "poAccountingDetail.paymentMethod.methodName",
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TotalMetrics />

      <SectionTitle>Purchase Orders</SectionTitle>

      <Card.Root>
        <DataTable.Default
          data={purchases}
          columns={purchasesColumns}
          filters={filters}
          onRowClick={(row) => handleClick(row, 'rowClick')}
          tableStateName="supplierDetailsPurchasesTab"
          initialSortBy={[{
            id: 'referenceCode',
            desc: true,
          }]}
        />
      </Card.Root>
    </div>
  );
};

export default PurchasesTab;
