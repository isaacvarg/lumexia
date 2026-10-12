'use client'
import { useMemo, useState } from "react"
import Link from "next/link"
import { TbBrandGmail, TbFileText, TbInbox, TbPhoto } from "react-icons/tb"
import Dialog from "@/components/Dialog"
import { formatDate } from "@/components/ItemDocuments/presentation"
import { InboxView } from "@/lib/documentInbox/types"
import type { InboxRow } from "../_rows"
import DocumentDetail from "./DocumentDetail"
import { sender, statusChip } from "./display"
import FileToItemDialogContent, { fileToItemDialogId } from "./FileToItemDialog"
import FileToPurchaseOrderDialogContent, { fileToPurchaseOrderDialogId } from "./FileToPurchaseOrderDialog"
import DismissDialogContent, { dismissDialogId } from "./DismissDialog"

export type InboxOptions = {
  fileTypes: { id: string; name: string; bgColor: string; textColor: string }[]
  suppliers: { id: string; name: string }[]
  accountingFileTypes: { id: string; name: string }[]
}

type Counts = Record<InboxView, number>

const viewTabs: { view: InboxView; label: string }[] = [
  { view: "review", label: "To review" },
  { view: "pending", label: "Unfiled" },
  { view: "agentFiled", label: "Filed by agent" },
  { view: "filed", label: "All filed" },
  { view: "dismissed", label: "Dismissed" },
]

const emptyText: Record<InboxView, string> = {
  review: "Nothing to review. Documents emailed to Lumexia show up here until they're filed and checked.",
  pending: "No unfiled documents.",
  agentFiled: "No agent filings waiting to be checked.",
  filed: "Nothing has been filed from the inbox yet.",
  dismissed: "No dismissed documents.",
}

const FileGlyph = ({ mimeType }: { mimeType: string }) =>
  mimeType.startsWith("image/") ? <TbPhoto className="size-4 shrink-0 text-base-content/50" /> : <TbFileText className="size-4 shrink-0 text-base-content/50" />

type Group = { message: InboxRow["message"]; documents: InboxRow[] }

const MessageCard = ({ group, selectedId, onSelect }: { group: Group; selectedId: string | null; onSelect: (id: string) => void }) => {
  const { message } = group
  return (
    <li className="shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="flex flex-col gap-0.5 border-b border-base-300 bg-base-200/50 px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            {message.source === "gmail" && <TbBrandGmail className="size-4 shrink-0 text-base-content/50" aria-label="Gmail" />}
            <span className="truncate font-medium">{sender(message)}</span>
          </span>
          <span className="shrink-0 text-xs text-base-content/60">{formatDate(message.receivedAt ?? message.createdAt)}</span>
        </div>
        <div className="truncate text-sm text-base-content/80">{message.subject ?? "(no subject)"}</div>
        {message.supplier && <div className="text-xs text-base-content/60">{message.supplier.name}</div>}
      </div>
      <ul>
        {group.documents.map((d) => {
          const chip = statusChip[d.status]
          const hint = d.filings[0]?.item?.name ?? d.filings[0]?.purchaseOrder?.referenceCode ?? d.suggestion?.item?.name
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => onSelect(d.id)}
                aria-current={selectedId === d.id ? "true" : undefined}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${selectedId === d.id ? "bg-primary/10" : "hover:bg-base-200"}`}
              >
                <FileGlyph mimeType={d.mimeType} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{d.fileName}</span>
                  {hint && (
                    <span className="block truncate text-xs text-base-content/60">
                      {d.filings.length > 0 ? "→ " : "Suggested: "}
                      {typeof hint === "number" ? `PO #${hint}` : hint}
                    </span>
                  )}
                </span>
                <span className={`badge badge-sm shrink-0 ${chip.className}`}>{chip.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

type Props = {
  view: InboxView
  counts: Counts
  documents: InboxRow[]
  initialDocumentId?: string
  options: InboxOptions
}

const Inbox = ({ view, counts, documents, initialDocumentId, options }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialDocumentId ?? documents[0]?.id ?? null)
  const [dialogDocumentId, setDialogDocumentId] = useState<string | null>(null)

  // after filing, the document may leave this view; fall back to the first one left
  const selected = documents.find((d) => d.id === selectedId) ?? documents[0] ?? null
  const dialogDocument = documents.find((d) => d.id === dialogDocumentId) ?? selected

  const groups = useMemo(() => {
    const byMessage = new Map<string, Group>()
    for (const d of documents) {
      const group = byMessage.get(d.message.id) ?? { message: d.message, documents: [] }
      group.documents.push(d)
      byMessage.set(d.message.id, group)
    }
    return Array.from(byMessage.values())
  }, [documents])

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex flex-wrap gap-2" aria-label="Inbox views">
        {viewTabs.map((t) => (
          <Link
            key={t.view}
            href={`/quality/documents/inbox?view=${t.view}`}
            aria-current={t.view === view ? "page" : undefined}
            className={`btn btn-sm ${t.view === view ? "btn-primary" : "btn-ghost border-base-300"}`}
          >
            {t.label}
            <span className={`badge badge-sm ${t.view === view ? "" : "badge-ghost"}`}>{counts[t.view]}</span>
          </Link>
        ))}
      </nav>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-base-300 px-4 py-14 text-center text-base-content/60">
          <TbInbox className="size-8" />
          <p className="max-w-md">{emptyText[view]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(280px,380px)_1fr]">
          <ul className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 xl:max-h-[calc(100vh-14rem)]">
            {groups.map((g) => <MessageCard key={g.message.id} group={g} selectedId={selected?.id ?? null} onSelect={setSelectedId} />)}
          </ul>
          {selected && <DocumentDetail key={selected.id} document={selected} onOpenDialog={() => setDialogDocumentId(selected.id)} />}
        </div>
      )}

      {dialogDocument && (
        <>
          <Dialog.Root identifier={fileToItemDialogId} contentClassName="max-h-[92vh] w-[95vw] max-w-3xl">
            <FileToItemDialogContent key={dialogDocument.id} document={dialogDocument} options={options} />
          </Dialog.Root>
          <Dialog.Root identifier={fileToPurchaseOrderDialogId} contentClassName="max-h-[92vh] w-[95vw] max-w-xl">
            <FileToPurchaseOrderDialogContent key={dialogDocument.id} document={dialogDocument} options={options} />
          </Dialog.Root>
          <Dialog.Root identifier={dismissDialogId} contentClassName="max-h-[92vh] w-[95vw] max-w-md">
            <DismissDialogContent key={dialogDocument.id} document={dialogDocument} />
          </Dialog.Root>
        </>
      )}
    </div>
  )
}

export default Inbox
