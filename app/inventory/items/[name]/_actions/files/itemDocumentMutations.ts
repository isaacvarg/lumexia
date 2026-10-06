'use server'

import prisma from "@/lib/prisma"
import { supersedeOlderItemFiles } from "@/lib/itemDocuments/supersede"
import { DocumentIssuer } from "@/lib/itemDocuments/types"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

export type ItemDocumentDetails = {
  fileTypeId: string
  issuer: DocumentIssuer
  supplierId: string | null
  lotId: string | null
  issuedAt: Date | null
  expiresAt: Date | null
  revision: string | null
  derivedFromId: string | null
}

const clean = (d: ItemDocumentDetails) => ({
  fileTypeId: d.fileTypeId,
  issuer: d.issuer === "internal" ? "internal" : "supplier",
  supplierId: d.supplierId || null,
  lotId: d.lotId || null,
  issuedAt: d.issuedAt,
  expiresAt: d.expiresAt,
  revision: d.revision?.trim() || null,
  // only our own documents are based on another one
  derivedFromId: d.issuer === "internal" ? d.derivedFromId || null : null,
})

// Files uploaded together share their details; each replaces older current versions of the same document.
export const createItemDocuments = async (itemId: string, files: { fileId: string; name: string }[], details: ItemDocumentDetails) => {
  await prisma.$transaction(async (tx) => {
    const created = await Promise.all(
      files.map((f) => tx.itemFile.create({ data: { itemId, fileId: f.fileId, ...clean(details) } }))
    )
    const batchIds = created.map((c) => c.id)
    for (const id of batchIds) {
      await supersedeOlderItemFiles(tx, id, { batchIds })
    }
  })

  const context = files.length === 1 ? `Uploaded file ${files[0].name}` : `Uploaded ${files.length} files`
  await createActivityLog("uploadFile", "item", itemId, { context })
}

// Editing details never replaces other files automatically; use setItemDocumentReplaced for that.
export const updateItemDocument = async (itemFileId: string, details: ItemDocumentDetails) => {
  const file = await prisma.itemFile.update({
    where: { id: itemFileId },
    data: clean(details),
    include: { file: { select: { name: true } } },
  })
  await createActivityLog("updateFile", "item", file.itemId, { context: `Updated details of ${file.file.name}` })
}

export const setItemDocumentReplaced = async (itemFileId: string, replaced: boolean) => {
  const file = await prisma.itemFile.update({
    where: { id: itemFileId },
    data: { supersededAt: replaced ? new Date() : null },
    include: { file: { select: { name: true } } },
  })
  await createActivityLog("updateFile", "item", file.itemId, {
    context: replaced ? `Marked ${file.file.name} as replaced` : `Restored ${file.file.name} as current`,
  })
}
