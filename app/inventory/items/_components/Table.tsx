"use client";
import DataTable from "@/components/DataTable";
import { columns } from "./Columns";
import { Filter } from "@/types/filter";
import { toFacetFilter } from "@/utils/data/toFacetFilter";
import { useRouter } from "next/navigation";
import { flattenItem } from "../_functions/flattenItem";
import { rowSelectionHandler } from "@/utils/auxiliary/rowSelectionHandler";
import { getSlug } from "@/utils/general/getSlug";
import { Item } from "@/actions/inventory/getAllItems";

type TableProps = {
  items: Item[];
};

const Table = ({ items }: TableProps) => {

  const router = useRouter();

  const tableData = flattenItem(items);

  const handleRowClick = (row: any, method?: any) => {
    const formattedName = getSlug(row.original.name)
    const path = `/inventory/items/${`${formattedName}?id=${row.original.id}`} `

    rowSelectionHandler(method, path, router)

  };

  const filters: Filter[] = [

    {
      columnName: "itemTypeName",
      filterLabel: "Item Type",
      options: toFacetFilter(tableData, "itemTypeName", "itemTypeName"),
    },

  ];

  return (
    <DataTable.Default
      actionButtonTitle="New Item"
      data={tableData}
      columns={columns}
      filters={filters}
      dialogIdentifier="createItem"
      onRowClick={(row, method) => handleRowClick(row, method)}
      onEnter={(row) => handleRowClick({ original: { ...row } })}
      tableStateName="items"
    />
  );
};

export default Table;
