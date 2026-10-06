'use client'
import { useEffect } from "react"
import Image from "next/image"
import { TbArchive, TbArrowBackUp, TbExternalLink, TbPencil, TbReplace, TbTrash, TbX } from "react-icons/tb"
import { useItemSelection } from "@/store/itemSlice"
import { DocumentStatus } from "@/lib/itemDocuments/types"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { useDocumentCommands } from "./DocumentMenu"
import { useFilesActions } from "./FilesContext"
import { FileIcon } from "./DocumentLibrary"
import { formatDate, issuerLabel, StatusBadge } from "@/components/ItemDocuments/presentation"

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <dt className="text-base-content/60">{label}</dt>
    <dd className="text-right font-medium">{children}</dd>
  </div>
)

type Props = { file: ItemFile; status?: DocumentStatus; onClose: () => void }

const DocumentPreview = ({ file, status, onClose }: Props) => {
  const { files } = useItemSelection()
  const { upload, preview } = useFilesActions()
  const commands = useDocumentCommands(file)
  const isPdf = file.file.mimeType === "application/pdf"
  const isImage = file.file.mimeType.startsWith("image/")
  const source = file.derivedFromId ? files.find((f) => f.id === file.derivedFromId) : null
  const derived = files.filter((f) => f.derivedFromId === file.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const replace = () =>
    upload({
      fileTypeId: file.fileTypeId,
      issuer: file.issuer === "internal" ? "internal" : "supplier",
      supplierId: file.supplierId ?? "",
      lotId: file.lotId ?? "",
    })

  return (
    <>
      <div className="fixed inset-0 z-30 bg-base-300/50" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label={file.file.name}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-2xl flex-col border-l border-base-300 bg-base-100 shadow-xl"
      >
        <header className="flex items-start gap-3 border-b border-base-300 p-4">
          <FileIcon file={file} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{file.file.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: file.fileType.bgColor, color: file.fileType.textColor }}>
                {file.fileType.name}
              </span>
              {file.supersededAt ? <span className="badge badge-ghost badge-sm">Replaced</span> : status && <StatusBadge status={status} />}
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-square" aria-label="Close"><TbX /></button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="overflow-hidden rounded-lg border border-base-300 bg-base-200">
            {isPdf ? (
              <iframe src={file.url} title={file.file.name} className="h-[55vh] w-full bg-white" />
            ) : isImage ? (
              <Image src={file.url} alt={file.file.name} width={800} height={600} unoptimized className="max-h-[55vh] w-full object-contain" />
            ) : (
              <p className="p-6 text-center text-sm text-base-content/60">No preview for this file type.</p>
            )}
          </div>

          <dl className="divide-y divide-base-300">
            <Detail label="Issued by">{issuerLabel(file.issuer)}</Detail>
            <Detail label="Supplier">{file.supplier?.name ?? "—"}</Detail>
            <Detail label="Lot">{file.lot?.lotNumber ?? "Not lot-specific"}</Detail>
            <Detail label="Issue date">{formatDate(file.issuedAt) ?? "—"}</Detail>
            <Detail label="Expiry date">{formatDate(file.expiresAt) ?? "From requirement"}</Detail>
            <Detail label="Revision">{file.revision ?? "—"}</Detail>
            {file.supersededAt && <Detail label="Replaced">{formatDate(file.supersededAt)}</Detail>}
            <Detail label="Uploaded">{formatDate(file.createdAt)}{file.file.uploadedBy.name && ` by ${file.file.uploadedBy.name}`}</Detail>
            {source && (
              <Detail label="Based on">
                <button type="button" onClick={() => preview(source)} className="link">{source.file.name}</button>
                {source.supersededAt && <span className="ml-1 text-warning">(replaced)</span>}
              </Detail>
            )}
            {derived.length > 0 && (
              <Detail label="Our versions">
                {derived.map((d) => (
                  <button key={d.id} type="button" onClick={() => preview(d)} className="link block">{d.file.name}</button>
                ))}
              </Detail>
            )}
          </dl>
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-base-300 p-4">
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm"><TbExternalLink /> Open</a>
          <button type="button" onClick={commands.edit} className="btn btn-sm"><TbPencil /> Edit details</button>
          {!file.supersededAt && <button type="button" onClick={replace} className="btn btn-sm"><TbReplace /> Upload new version</button>}
          <button type="button" onClick={commands.toggleReplaced} className="btn btn-ghost btn-sm">
            {file.supersededAt ? <><TbArrowBackUp /> Restore as current</> : <><TbArchive /> Mark as replaced</>}
          </button>
          <button type="button" onClick={async () => (await commands.remove()) && onClose()} className="btn btn-ghost btn-sm ml-auto text-error">
            <TbTrash /> Delete
          </button>
        </footer>
      </aside>
    </>
  )
}

export default DocumentPreview
