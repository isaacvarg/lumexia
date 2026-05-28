"use client";
import SortableHead from "@/components/DataTable/SortableHead";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { Experiment } from "@/actions/research/getAllExperiments";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Experiment>();

const formatReferenceCode = (code: number) => `EXP-${String(code).padStart(4, "0")}`;

export const columns = [
  columnHelper.accessor("referenceCode", {
    header: SortableHeaderType("Reference"),
    cell: (row) => formatReferenceCode(row.row.original.referenceCode),
  }),
  columnHelper.accessor("objective", {
    header: SortableHeaderType("Objective"),
    cell: (row) => {
      const objective = row.row.original.objective ?? "";
      return objective.length > 80 ? `${objective.slice(0, 80)}…` : objective;
    },
  }),
  columnHelper.accessor((r) => r.status?.name ?? "", {
    id: "statusName",
    header: "Status",
    cell: (row) => {
      const status = row.row.original.status;
      if (!status) return null;
      return (
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: status.bgColor, color: status.textColor }}
        >
          {status.name}
        </span>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor((r) => r.primaryInvestigator?.name ?? "", {
    id: "investigatorName",
    header: "Investigator",
  }),
  columnHelper.accessor((r) => r.primarySubject?.name ?? "", {
    id: "subjectName",
    header: "Subject",
  }),
  columnHelper.accessor((r) => r.experimentGroup?.label ?? "", {
    id: "groupLabel",
    header: "Group",
  }),
  columnHelper.accessor("createdAt", {
    header: SortableHeaderType("Created"),
    cell: (row) => new Date(row.row.original.createdAt).toLocaleDateString(),
  }),
];
