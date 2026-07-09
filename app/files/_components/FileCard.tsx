'use client'
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/Text/Tag";
import { UnifiedFileEntry } from "../_actions/getAllFiles";

const MODULE_LABELS: Record<string, string> = {
  "item": "Item",
  "po-accounting": "PO Accounting",
  "qc-record": "QC Record",
  "bpr-staging": "BPR Staging",
  "general-request": "General Request",
  "note": "Note Attachment",
  "unassigned": "Unassigned",
};

const FileCard = ({ entry }: { entry: UnifiedFileEntry }) => {
  let extType = "other";
  if (entry.mimeType === "application/pdf") extType = "pdf";
  else if (entry.mimeType.startsWith("image/")) extType = "image";

  const { name: uploaderName, image: uploaderImage } = entry.uploadedBy;

  return (
    <Link href={`/files/${entry.id}`} className="card card-side bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <figure className="relative w-32 shrink-0">
        {entry.thumbnailUrl ? (
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src={entry.thumbnailUrl}
            alt={entry.name}
            width={128}
            height={160}
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-base-300 flex items-center justify-center">
            <span className="text-base-content/40 text-xs uppercase font-poppins font-semibold">
              {extType}
            </span>
          </div>
        )}
      </figure>

      <div className="card-body gap-2 min-w-0">
        <h2 className="card-title text-sm font-poppins truncate">{entry.name}</h2>

        <div className="flex flex-wrap gap-2">
          <Tag text="normal" color="accent" label={extType} tooltip="Extension" />
          <Tag
            text="normal"
            color="default"
            label={MODULE_LABELS[entry.module] ?? entry.module}
            tooltip="Module"
          />
          {entry.fileType && (
            <Tag
              text="normal"
              bgColor={entry.fileType.bgColor}
              textColor={entry.fileType.textColor}
              label={entry.fileType.name}
              tooltip="File Type"
            />
          )}
          {entry.tags.map((t) => (
            <Tag
              key={t.id}
              text="normal"
              bgColor={t.bgColor}
              textColor={t.textColor}
              label={t.name}
              tooltip="Tag"
            />
          ))}
        </div>

        {uploaderName && uploaderImage && (
          <div className="card-actions mt-auto">
            <div className="tooltip" data-tip={uploaderName}>
              <Image
                src={uploaderImage}
                className="rounded-full h-7 w-7"
                alt={uploaderName}
                width={28}
                height={28}
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default FileCard;
