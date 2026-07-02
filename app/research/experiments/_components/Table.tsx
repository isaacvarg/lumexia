"use client";
import DataTable from "@/components/DataTable";
import { columns } from "./Columns";
import { Filter } from "@/types/filter";
import { toFacetFilter } from "@/utils/data/toFacetFilter";
import { useRouter } from "next/navigation";
import { rowSelectionHandler } from "@/utils/auxiliary/rowSelectionHandler";
import { Experiment } from "@/actions/research/getAllExperiments";

type TableProps = {
  experiments: Experiment[];
};

const Table = ({ experiments }: TableProps) => {
  const router = useRouter();

  const handleRowClick = (row: any, method?: any) => {
    const path = `/research/experiments/${row.original.referenceCode}?id=${row.original.id}`;
    rowSelectionHandler(method, path, router);
  };

  const filters: Filter[] = [
    {
      columnName: "statusName",
      filterLabel: "Status",
      options: toFacetFilter(experiments, "status.name", "status.name"),
    },
    {
      columnName: "subjectName",
      filterLabel: "Subject",
      options: toFacetFilter(
        experiments,
        "primarySubject.name",
        "primarySubject.name",
      ),
    },
  ];

  return (
    <DataTable.Default
      data={experiments}
      columns={columns}
      filters={filters}
      dialogIdentifier="createExperiment"
      onRowClick={(row, method) => handleRowClick(row, method)}
      onEnter={(row) => handleRowClick({ original: { ...row } })}
      tableStateName="experiments"
    />
  );
};

export default Table;
