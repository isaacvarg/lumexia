'use client'
import { createColumnHelper } from "@tanstack/react-table";
import { UnifiedFileEntry } from "../_actions/getAllFiles";
import { SortableHeaderType } from "@/components/DataTable/SortableHeaderType";
import { FilterFunction } from "@/components/DataTable/FilterFunction";
import Tag from "@/components/Text/Tag";
import Image from "next/image";
import Link from "next/link";
import { DateTime } from "luxon";
import { dateFormatWithTime } from "@/configs/data/dateFormatString";
import { FiExternalLink } from "react-icons/fi";
import { LuLock, LuGlobe } from "react-icons/lu";

const MODULE_LABELS: Record<string, string> = {
  item: "Item",
  "po-accounting": "PO Accounting",
  "qc-record": "QC Record",
  "bpr-staging": "BPR Staging",
  "general-request": "General Request",
  note: "Note Attachment",
  unassigned: "Unassigned",
};

function getExtType(mimeType: string) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return "other";
}

const columnHelper = createColumnHelper<UnifiedFileEntry>();

export const getFileColumns = () => [
  columnHelper.display({
    id: "open",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/files/${row.original.id}`}
        onClick={(e) => e.stopPropagation()}
        className="btn btn-ghost btn-xs"
      >
        <FiExternalLink className="text-base" />
      </Link>
    ),
  }),
  columnHelper.accessor("name", {
    header: SortableHeaderType("Name"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        {row.original.thumbnailUrl ? (
          <Image
            src={row.original.thumbnailUrl}
            alt={row.original.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded object-cover shrink-0"
            unoptimized
          />
        ) : (
          <div className="h-8 w-8 rounded bg-base-300 flex items-center justify-center shrink-0">
            <span className="text-base-content/40 text-[10px] uppercase font-poppins font-semibold">
              {getExtType(row.original.mimeType)}
            </span>
          </div>
        )}
        <span className="truncate">{row.original.name}</span>
      </div>
    ),
  }),
  columnHelper.accessor("module", {
    header: SortableHeaderType("Module"),
    cell: ({ getValue }) => (
      <Tag text="normal" color="default" label={MODULE_LABELS[getValue()] ?? getValue()} />
    ),
    filterFn: FilterFunction,
  }),
  columnHelper.accessor((row) => row.fileType?.name ?? "", {
    id: "fileType",
    header: SortableHeaderType("File Type"),
    cell: ({ row }) => {
      const ft = row.original.fileType;
      if (!ft) return null;
      return <Tag text="normal" bgColor={ft.bgColor} textColor={ft.textColor} label={ft.name} />;
    },
    filterFn: (row, _columnId, filterValue) => {
      if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
      const key = `${row.original.module}::${row.original.fileType?.name ?? ""}`;
      return filterValue.includes(key);
    },
  }),
  columnHelper.accessor((row) => getExtType(row.mimeType), {
    id: "extension",
    header: SortableHeaderType("Ext"),
    cell: ({ getValue }) => (
      <Tag text="normal" color="accent" label={getValue()} />
    ),
    filterFn: FilterFunction,
  }),
  columnHelper.display({
    id: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags.map((t) => (
          <Tag key={t.id} text="normal" bgColor={t.bgColor} textColor={t.textColor} label={t.name} />
        ))}
      </div>
    ),
    filterFn: (row, _columnId, filterValue) => {
      if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
      return row.original.tags.some((t) => filterValue.includes(t.id));
    },
  }),
  columnHelper.accessor("public", {
    header: SortableHeaderType("Public"),
    cell: ({ getValue }) =>
      getValue() ? (
        <LuGlobe className="text-success text-lg" />
      ) : (
        <LuLock className="text-base-content/40 text-lg" />
      ),
    filterFn: FilterFunction,
  }),
  columnHelper.accessor("uploadedBy.name", {
    id: "uploadedBy",
    header: SortableHeaderType("Uploaded By"),
    cell: ({ row }) => {
      const { name, image } = row.original.uploadedBy;
      if (!name) return null;
      return (
        <div className="flex items-center gap-2">
          {image && (
            <Image src={image} alt={name} width={24} height={24} className="rounded-full h-6 w-6" unoptimized />
          )}
          <span>{name}</span>
        </div>
      );
    },
    filterFn: FilterFunction,
  }),
  columnHelper.accessor("createdAt", {
    header: SortableHeaderType("Created"),
    cell: ({ getValue }) =>
      DateTime.fromJSDate(getValue()).toFormat(dateFormatWithTime),
    sortingFn: "datetime",
  }),
];
