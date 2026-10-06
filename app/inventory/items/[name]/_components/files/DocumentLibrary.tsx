'use client'
import { useMemo, useState } from "react"
import Image from "next/image"
import { TbChevronDown, TbChevronRight, TbFile, TbFileTypePdf, TbPhoto, TbSearch, TbWorld } from "react-icons/tb"
import { useItemSelection } from "@/store/itemSlice"
import { DocumentStatus } from "@/lib/itemDocuments/types"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { useFilesActions } from "./FilesContext"
import { formatDate, issuerLabel, StatusBadge } from "@/components/ItemDocuments/presentation"
import DocumentMenu from "./DocumentMenu"

const versionKey = (f: ItemFile) => [f.fileTypeId, f.issuer, f.lotId ?? "", f.supplierId ?? ""].join("|")

export const FileIcon = ({ file, size = "size-10" }: { file: ItemFile; size?: string }) => {
  if (file.thumbnailUrl) {
    return (
      <Image src={file.thumbnailUrl} alt="" width={40} height={40} unoptimized className={`${size} shrink-0 rounded-md border border-base-300 object-cover`} />
    )
  }
  const Icon = file.file.mimeType === "application/pdf" ? TbFileTypePdf : file.file.mimeType.startsWith("image/") ? TbPhoto : TbFile
  return (
    <div className={`${size} grid shrink-0 place-items-center rounded-md bg-base-200 text-base-content/50`}>
      <Icon className="size-5" />
    </div>
  )
}

const DocumentRow = ({ file, status, versions }: { file: ItemFile; status?: DocumentStatus; versions: ItemFile[] }) => {
  const { preview } = useFilesActions()
  const [open, setOpen] = useState(false)
  const replaced = !!file.supersededAt
  const meta = [
    file.supplier?.name,
    file.lot && `Lot ${file.lot.lotNumber}`,
    file.revision && `Rev ${file.revision}`,
    file.issuedAt && `Issued ${formatDate(file.issuedAt)}`,
    file.expiresAt && `Expires ${formatDate(file.expiresAt)}`,
    replaced && `Replaced ${formatDate(file.supersededAt)}`,
  ].filter(Boolean)

  return (
    <>
      <div className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-base-200/50 ${replaced ? "opacity-60" : ""}`}>
        <button type="button" onClick={() => preview(file)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <FileIcon file={file} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium group-hover:underline">{file.file.name}</span>
              {file.file.public && <TbWorld className="size-4 shrink-0 text-base-content/50" title="Public" />}
            </div>
            <div className="truncate text-xs text-base-content/50">{meta.join(" · ") || `Uploaded ${formatDate(file.createdAt)}`}</div>
          </div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: file.fileType.bgColor, color: file.fileType.textColor }}>
            {file.fileType.abbreviaton || file.fileType.name}
          </span>
          <span className="w-14 text-xs text-base-content/60">{issuerLabel(file.issuer)}</span>
          <span className="w-28">{status && !replaced && <StatusBadge status={status} size="xs" />}</span>
          {file.file.fileTags.slice(0, 2).map((ft) => (
            <span key={ft.id} className="rounded px-1.5 text-xs" style={{ backgroundColor: ft.tag.bgColor, color: ft.tag.textColor }}>{ft.tag.name}</span>
          ))}
        </div>

        {versions.length > 0 ? (
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-ghost btn-xs" aria-expanded={open}>
            {open ? <TbChevronDown /> : <TbChevronRight />}
            {versions.length} older
          </button>
        ) : (
          <span className="hidden w-[4.5rem] md:block" />
        )}

        <DocumentMenu file={file} />
      </div>

      {open && (
        <div className="border-l-2 border-base-300 bg-base-200/30 pl-4">
          {versions.map((v) => <DocumentRow key={v.id} file={v} versions={[]} />)}
        </div>
      )}
    </>
  )
}

const DocumentLibrary = ({ statusByFile }: { statusByFile: Map<string, DocumentStatus> }) => {
  const { files, options } = useItemSelection()
  const [query, setQuery] = useState("")
  const [typeId, setTypeId] = useState<string | null>(null)

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of files) counts.set(f.fileTypeId, (counts.get(f.fileTypeId) ?? 0) + 1)
    return counts
  }, [files])

  // Current files are rows; replaced versions hang off the first current file with the same type, issuer,
  // lot and supplier. Replaced files with no current version left are shown as rows of their own.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const visible = files.filter(
      (f) =>
        (!typeId || f.fileTypeId === typeId) &&
        (!q || [f.file.name, f.supplier?.name, f.lot?.lotNumber, f.revision].some((s) => s?.toLowerCase().includes(q)))
    )
    const replacedByKey = new Map<string, ItemFile[]>()
    for (const f of visible.filter((f) => f.supersededAt)) {
      replacedByKey.set(versionKey(f), [...(replacedByKey.get(versionKey(f)) ?? []), f])
    }
    const result: { file: ItemFile; versions: ItemFile[] }[] = []
    for (const f of visible.filter((f) => !f.supersededAt)) {
      const key = versionKey(f)
      result.push({ file: f, versions: replacedByKey.get(key) ?? [] })
      replacedByKey.delete(key)
    }
    for (const orphans of Array.from(replacedByKey.values())) {
      for (const f of orphans) result.push({ file: f, versions: [] })
    }
    return result
  }, [files, query, typeId])

  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="flex flex-col gap-3 border-b border-base-300 bg-base-200/60 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <h3 className="font-semibold">All documents <span className="font-normal text-base-content/50">({files.length})</span></h3>
        <label className="input input-sm w-full md:w-64">
          <TbSearch className="text-base-content/50" />
          <input type="search" placeholder="Search name, supplier, lot" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-base-300 px-4 py-2">
          <button type="button" onClick={() => setTypeId(null)} className={`btn btn-xs ${typeId === null ? "btn-neutral" : "btn-ghost"}`}>
            All
          </button>
          {options.itemFileTypes.filter((t) => typeCounts.has(t.id)).map((t) => (
            <button key={t.id} type="button" onClick={() => setTypeId(t.id)} className={`btn btn-xs ${typeId === t.id ? "btn-neutral" : "btn-ghost"}`}>
              {t.name} <span className="opacity-60">{typeCounts.get(t.id)}</span>
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-base-content/50">
          {files.length === 0 ? "No documents uploaded yet." : "No documents match."}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-base-300">
          {rows.map((r) => <DocumentRow key={r.file.id} file={r.file} versions={r.versions} status={statusByFile.get(r.file.id)} />)}
        </div>
      )}
    </section>
  )
}

export default DocumentLibrary
