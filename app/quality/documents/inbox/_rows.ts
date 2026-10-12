import { fileActions } from "@/actions/files"
import { effectiveStatus, findOnFileByMd5, InboxDocumentRow, itemDocumentsHref, purchaseOrderHref, readSuggestion } from "@/lib/documentInbox/queries"
import prisma from "@/lib/prisma"

// Inbox documents shaped for the page: signed file links, where each was filed, and where an identical
// file is already on file.
export const toInboxRows = async (rows: InboxDocumentRow[]) => {
  const onFile = await findOnFileByMd5(prisma, rows.map((r) => r.md5))

  return Promise.all(rows.map(async (d) => {
    const url = await fileActions.getUrl(d.file.bucketName, d.file.objectName)
    const filings = d.filings.map((f) => ({
      id: f.id,
      via: f.via as "user" | "agent",
      reason: f.reason,
      createdAt: f.createdAt,
      filedBy: f.filedBy.name,
      item: f.itemFile
        ? {
          ...f.itemFile.item,
          documentId: f.itemFile.id,
          href: itemDocumentsHref(f.itemFile.item),
          fileType: f.itemFile.fileType,
          lotNumber: f.itemFile.lot?.lotNumber ?? null,
          supplierLot: f.itemFile.supplierLotNumber,
          replaced: !!f.itemFile.supersededAt,
        }
        : null,
      purchaseOrder: f.poAccountingFile
        ? {
          referenceCode: f.poAccountingFile.purchaseOrder.referenceCode,
          href: purchaseOrderHref(f.poAccountingFile.purchaseOrder),
          supplier: f.poAccountingFile.purchaseOrder.supplier.name,
          fileType: f.poAccountingFile.fileType.name,
        }
        : null,
    }))
    const filedHere = new Set(d.filings.flatMap((f) => [f.itemFile?.id, f.poAccountingFile?.id]).filter(Boolean))

    return {
      id: d.id,
      status: effectiveStatus(d),
      fileName: d.file.name,
      mimeType: d.file.mimeType,
      size: d.file.size,
      url,
      createdAt: d.createdAt,
      suggestion: readSuggestion(d.suggestion),
      suggestedAt: d.suggestedAt,
      checkedAt: d.checkedAt,
      checkedBy: d.checkedBy?.name ?? null,
      dismissedAt: d.dismissedAt,
      dismissedBy: d.dismissedBy?.name ?? null,
      dismissReason: d.dismissReason,
      filings,
      // the same bytes filed somewhere other than through this document
      onFile: (onFile.get(d.md5) ?? []).filter((o) => !filedHere.has(o.id)),
      message: d.message,
    }
  }))
}

export type InboxRow = Awaited<ReturnType<typeof toInboxRows>>[number]
