'use client'
import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  TbAlertTriangle,
  TbArrowBackUp,
  TbCheck,
  TbExternalLink,
  TbFileCertificate,
  TbReceipt,
  TbRobot,
  TbSparkles,
  TbTrash,
} from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import { formatDate } from "@/components/ItemDocuments/presentation"
import { markChecked, restoreDocument, undoFiling } from "../_actions"
import type { InboxRow } from "../_rows"
import { sender, statusChip } from "./display"
import { fileToItemDialogId } from "./FileToItemDialog"
import { fileToPurchaseOrderDialogId } from "./FileToPurchaseOrderDialog"
import { dismissDialogId } from "./DismissDialog"

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex gap-4 py-1 text-sm">
    <dt className="w-24 shrink-0 text-base-content/60">{label}</dt>
    <dd className="min-w-0 flex-1 break-words">{children}</dd>
  </div>
)

const sourceLabel: Record<string, string> = { gmail: "Gmail", paperless: "Paperless", manual: "Uploaded" }

const Filing = ({ filing, onUndo, busy }: { filing: InboxRow["filings"][number]; onUndo: () => void; busy: boolean }) => (
  <li className="flex flex-col gap-1 rounded-lg border border-base-300 px-3 py-2">
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {filing.item ? (
        <>
          <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: filing.item.fileType.bgColor, color: filing.item.fileType.textColor }}>
            {filing.item.fileType.name}
          </span>
          <Link href={filing.item.href} className="link font-medium">{filing.item.name}</Link>
          {filing.item.lotNumber
            ? <span className="text-base-content/60">· lot {filing.item.lotNumber}</span>
            : filing.item.supplierLot && <span className="text-base-content/60">· waiting for supplier lot {filing.item.supplierLot}</span>}
          {filing.item.replaced && <span className="badge badge-ghost badge-sm">Replaced since</span>}
        </>
      ) : filing.purchaseOrder ? (
        <>
          <TbReceipt className="size-4 text-base-content/60" />
          <Link href={filing.purchaseOrder.href} className="link font-medium">PO #{filing.purchaseOrder.referenceCode}</Link>
          <span className="text-base-content/60">· {filing.purchaseOrder.supplier} · {filing.purchaseOrder.fileType}</span>
        </>
      ) : null}
      <button type="button" onClick={onUndo} disabled={busy} className="btn btn-ghost btn-xs ml-auto">
        <TbArrowBackUp /> Take back
      </button>
    </div>
    <div className="text-xs text-base-content/60">
      {filing.via === "agent" ? "Filed by the agent" : `Filed by ${filing.filedBy ?? "someone"}`} {formatDate(filing.createdAt)}
    </div>
    {filing.reason && <p className="text-sm text-base-content/80">“{filing.reason}”</p>}
  </li>
)

const Suggestion = ({ suggestion }: { suggestion: NonNullable<InboxRow["suggestion"]> }) => {
  const parts = [
    suggestion.item && `${suggestion.item.name} (${suggestion.item.referenceCode})`,
    suggestion.fileType?.name,
    suggestion.issuer === "internal" ? "our own" : null,
    suggestion.supplier?.name,
    suggestion.supplierLot && `supplier lot ${suggestion.supplierLot}`,
    suggestion.purchaseOrder && `PO #${suggestion.purchaseOrder.referenceCode}`,
    suggestion.issuedAt && `issued ${suggestion.issuedAt}`,
    suggestion.revision && `rev ${suggestion.revision}`,
  ].filter(Boolean)
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-info/10 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <TbSparkles className="size-4" /> Agent&apos;s suggestion
        {suggestion.confidence && <span className="badge badge-ghost badge-sm">{suggestion.confidence} confidence</span>}
      </div>
      <p>{suggestion.reason}</p>
      {parts.length > 0 && <p className="text-base-content/70">{parts.join(" · ")}</p>}
    </div>
  )
}

const DocumentDetail = ({ document: d, onOpenDialog }: { document: InboxRow; onOpenDialog: () => void }) => {
  const router = useRouter()
  const { showDialog } = useDialog()
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showBody, setShowBody] = useState(false)
  const { message } = d
  const chip = statusChip[d.status]
  const isPdf = d.mimeType === "application/pdf"
  const isImage = d.mimeType.startsWith("image/")

  const open = (dialogId: string) => {
    onOpenDialog()
    showDialog(dialogId)
  }

  const act = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError(null)
      const result = await fn()
      if (result.error) setError(result.error)
      router.refresh()
    })

  const suggestsPurchaseOrder = d.suggestion?.target === "purchaseOrder"

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 p-4 xl:sticky xl:top-4" aria-label={d.fileName}>
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-lg font-semibold">{d.fileName}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
            <span className={`badge badge-sm ${chip.className}`}>{chip.label}</span>
            <span>{Math.max(1, Math.round(d.size / 1024))} KB</span>
          </div>
        </div>
        <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm"><TbExternalLink /> Open</a>
      </header>

      {d.status === "agentFiled" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-sm">
          <TbRobot className="size-5 shrink-0" />
          <span className="min-w-0 flex-1">The agent filed this. Check it went to the right place, or take it back.</span>
          <button type="button" disabled={busy} onClick={() => act(() => markChecked(d.id))} className="btn btn-sm btn-primary">
            <TbCheck /> Looks right
          </button>
        </div>
      )}

      {d.filings.length > 0 && (
        <ul className="flex flex-col gap-2">
          {d.filings.map((f) => <Filing key={f.id} filing={f} busy={busy} onUndo={() => act(() => undoFiling(f.id))} />)}
        </ul>
      )}
      {d.status === "filed" && d.checkedBy && (
        <p className="-mt-2 text-xs text-base-content/60">Checked by {d.checkedBy} {formatDate(d.checkedAt)}</p>
      )}

      {d.status !== "dismissed" && d.filings.length === 0 && d.suggestion && <Suggestion suggestion={d.suggestion} />}

      {d.onFile.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm">
          <TbAlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            The same file is already on file:{" "}
            {d.onFile.map((o, i) => (
              <span key={o.id}>{i > 0 && ", "}<Link href={o.href} className="link">{o.label}</Link></span>
            ))}
          </span>
        </div>
      )}

      {d.status === "dismissed" ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-base-200 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1">
            Dismissed{d.dismissedBy ? ` by ${d.dismissedBy}` : " automatically"} {formatDate(d.dismissedAt)}
            {d.dismissReason && <span className="block text-base-content/60">{d.dismissReason}</span>}
          </span>
          <button type="button" disabled={busy} onClick={() => act(() => restoreDocument(d.id))} className="btn btn-sm">
            <TbArrowBackUp /> Restore
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => open(fileToItemDialogId)} className={`btn btn-sm ${!suggestsPurchaseOrder && d.filings.length === 0 ? "btn-primary" : ""}`}>
            <TbFileCertificate /> {d.filings.length > 0 ? "Also file on an item" : d.suggestion?.item ? "File as suggested" : "File on an item"}
          </button>
          <button type="button" onClick={() => open(fileToPurchaseOrderDialogId)} className={`btn btn-sm ${suggestsPurchaseOrder && d.filings.length === 0 ? "btn-primary" : ""}`}>
            <TbReceipt /> File on a PO
          </button>
          {d.filings.length === 0 && (
            <button type="button" onClick={() => open(dismissDialogId)} className="btn btn-ghost btn-sm ml-auto text-error">
              <TbTrash /> Dismiss
            </button>
          )}
        </div>
      )}

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <dl className="divide-y divide-base-300 rounded-lg border border-base-300 px-3 py-1">
        <Detail label="From">
          {sender(message)}
          {message.senderName && message.senderEmail && <span className="text-base-content/60"> &lt;{message.senderEmail}&gt;</span>}
        </Detail>
        <Detail label="Supplier">{message.supplier?.name ?? <span className="text-base-content/50">Not matched from the sender</span>}</Detail>
        <Detail label="Subject">{message.subject ?? "—"}</Detail>
        <Detail label="Received">
          {formatDate(message.receivedAt ?? message.createdAt)} via {sourceLabel[message.source] ?? message.source}
          {message.sourceUrl && (
            <a href={message.sourceUrl} target="_blank" rel="noopener noreferrer" className="link ml-2 inline-flex items-center gap-1">
              Open email <TbExternalLink className="size-3" />
            </a>
          )}
        </Detail>
        {message.body && (
          <Detail label="Message">
            <p className={`whitespace-pre-wrap text-base-content/80 ${showBody ? "" : "line-clamp-4"}`}>{message.body}</p>
            <button type="button" onClick={() => setShowBody((s) => !s)} className="link text-xs">
              {showBody ? "Show less" : "Show the whole email"}
            </button>
          </Detail>
        )}
      </dl>

      <div className="overflow-hidden rounded-lg border border-base-300 bg-base-200">
        {isPdf ? (
          <iframe src={d.url} title={d.fileName} className="h-[65vh] w-full bg-white" />
        ) : isImage ? (
          <Image src={d.url} alt={d.fileName} width={900} height={700} unoptimized className="max-h-[65vh] w-full object-contain" />
        ) : (
          <p className="p-6 text-center text-sm text-base-content/60">No preview for this file type. Use Open to download it.</p>
        )}
      </div>
    </section>
  )
}

export default DocumentDetail
