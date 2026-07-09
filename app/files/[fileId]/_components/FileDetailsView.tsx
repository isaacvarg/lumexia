'use client'
import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { TbExternalLink, TbFile, TbPencil, TbPlus, TbX } from "react-icons/tb"
import Tag from "@/components/Text/Tag"
import useDialog from "@/hooks/useDialog"
import EditNameDialog from "./EditNameDialog"
import EditFileTypeDialog from "./EditFileTypeDialog"
import AddTagDialog from "./AddTagDialog"
import { FileDetails } from "../_actions/getFileDetails"
import { updateFilePublic } from "../_actions/updateFilePublic"
import { removeFileTag } from "../_actions/removeFileTag"

const MODULE_LABELS: Record<string, string> = {
  "item": "Item",
  "po-accounting": "PO Accounting",
  "qc-record": "QC Record",
  "bpr-staging": "BPR Staging",
  "general-request": "General Request",
  "note": "Note Attachment",
  "unassigned": "Unassigned",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

const FileDetailsView = ({ details }: { details: FileDetails }) => {
  const { showDialog } = useDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { file, url, thumbnailUrl, module, junctionId, fileType, ownerLink, availableFileTypes, tags } = details;

  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType.startsWith("image/");
  const extType = isPdf ? "pdf" : isImage ? "image" : "other";

  const handleTogglePublic = () => {
    startTransition(async () => {
      await updateFilePublic(file.id, !file.public);
      router.refresh();
    });
  };

  const handleRemoveTag = (fileTagId: string) => {
    startTransition(async () => {
      await removeFileTag(fileTagId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Dialogs */}
      <EditNameDialog fileId={file.id} currentName={file.name} />
      {junctionId && availableFileTypes.length > 0 && fileType && (
        <EditFileTypeDialog
          fileId={file.id}
          module={module}
          junctionId={junctionId}
          currentFileTypeId={fileType.id}
          availableFileTypes={availableFileTypes}
        />
      )}
      <AddTagDialog fileId={file.id} existingTagIds={tags.map((t) => t.tag.id)} />

      {/* Preview */}
      <div className="w-full lg:w-3/5 shrink-0">
        {isPdf && (
          <iframe
            src={url}
            className="w-full h-[80vh] rounded-lg border border-base-300 shadow-sm"
            title={file.name}
          />
        )}
        {isImage && (
          <div className="w-full flex items-center justify-center bg-base-200 rounded-lg p-4 min-h-[50vh]">
            <Image
              src={url}
              alt={file.name}
              width={1200}
              height={800}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-sm"
              unoptimized
            />
          </div>
        )}
        {!isPdf && !isImage && (
          <div className="w-full flex flex-col items-center justify-center bg-base-200 rounded-lg p-12 gap-4 min-h-[30vh]">
            <TbFile className="size-16 text-base-content/30" />
            <p className="font-poppins text-base-content/50 text-sm uppercase tracking-wide">{file.mimeType}</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline gap-2">
              <TbExternalLink className="size-4" /> Open file
            </a>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body gap-4">

            {/* Name */}
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-poppins text-xl font-semibold text-base-content leading-tight break-all">
                {file.name}
              </h1>
              <button
                className="btn btn-ghost btn-sm btn-square shrink-0"
                onClick={() => showDialog("editFileName")}
                title="Rename file"
              >
                <TbPencil className="size-4" />
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              <Tag text="normal" color="accent" label={extType} tooltip="Extension" />
              <Tag text="normal" color="default" label={MODULE_LABELS[module] ?? module} tooltip="Module" />
              {fileType && (
                <div className="flex items-center gap-1">
                  <Tag
                    text="normal"
                    bgColor={fileType.bgColor}
                    textColor={fileType.textColor}
                    label={fileType.name}
                    tooltip="File Type"
                  />
                  {junctionId && availableFileTypes.length > 0 && (
                    <button
                      className="btn btn-ghost btn-xs btn-square"
                      onClick={() => showDialog("editFileType")}
                      title="Change file type"
                    >
                      <TbPencil className="size-3" />
                    </button>
                  )}
                </div>
              )}
              {tags.map((ft) => (
                <div key={ft.id} className="flex items-center gap-1">
                  <Tag
                    text="normal"
                    bgColor={ft.tag.bgColor}
                    textColor={ft.tag.textColor}
                    label={ft.tag.name}
                    tooltip="Tag"
                  />
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    disabled={isPending}
                    onClick={() => handleRemoveTag(ft.id)}
                    title="Remove tag"
                  >
                    <TbX className="size-3" />
                  </button>
                </div>
              ))}
              <button
                className="btn btn-ghost btn-xs gap-1"
                onClick={() => showDialog("addFileTag")}
                title="Add tag"
              >
                <TbPlus className="size-3" /> Tag
              </button>
            </div>

            <div className="divider my-0" />

            {/* Properties */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm font-poppins">
              <dt className="text-base-content/50">Size</dt>
              <dd className="text-base-content font-medium">{formatBytes(file.size)}</dd>

              <dt className="text-base-content/50">MIME type</dt>
              <dd className="text-base-content font-medium break-all">{file.mimeType}</dd>

              <dt className="text-base-content/50">Uploaded</dt>
              <dd className="text-base-content font-medium">{formatDate(file.createdAt)}</dd>

              <dt className="text-base-content/50">Modified</dt>
              <dd className="text-base-content font-medium">{formatDate(file.updatedAt)}</dd>

              <dt className="text-base-content/50">Public</dt>
              <dd>
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  checked={file.public}
                  disabled={isPending}
                  onChange={handleTogglePublic}
                />
              </dd>

              {file.uploadedBy.name && (
                <>
                  <dt className="text-base-content/50">Uploaded by</dt>
                  <dd className="flex items-center gap-2">
                    {file.uploadedBy.image && (
                      <Image
                        src={file.uploadedBy.image}
                        alt={file.uploadedBy.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                        unoptimized
                      />
                    )}
                    <span className="text-base-content font-medium">{file.uploadedBy.name}</span>
                  </dd>
                </>
              )}
            </dl>

            <div className="divider my-0" />

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm gap-2 w-full"
              >
                <TbExternalLink className="size-4" /> Open in new tab
              </a>

              {ownerLink && (
                <Link href={ownerLink.href} className="btn btn-primary btn-sm gap-2 w-full">
                  Go to {ownerLink.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsView;
