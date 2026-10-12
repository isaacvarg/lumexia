'use server'

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUserId } from "@/actions/users/getUserId"
import { ItemDocumentDetails } from "@/lib/itemDocuments/mutations"
import {
  dismissInboxDocument,
  fileInboxDocumentToItem,
  fileInboxDocumentToPurchaseOrder,
  InboxError,
  markInboxDocumentChecked,
  restoreInboxDocument,
  undoInboxFiling,
} from "@/lib/documentInbox/mutations"
import { getItemDocuments } from "@/app/inventory/items/[name]/_actions/files/getItemDocuments"
import { getAllItemFiles } from "@/app/inventory/items/[name]/_actions/files/getAllItemFiles"

const inboxPath = "/quality/documents/inbox"

// Expected problems (already filed there, filed elsewhere first) come back as a message for the dialog.
const run = async (fn: (userId: string) => Promise<unknown>): Promise<{ error?: string }> => {
  try {
    await fn(await getUserId())
    revalidatePath(inboxPath)
    return {}
  } catch (e) {
    if (e instanceof InboxError) return { error: e.message }
    throw e
  }
}

export const searchItemsForFiling = async (query: string) => {
  const q = query.trim()
  if (q.length < 2) return []
  const contains = { contains: q, mode: "insensitive" as const }
  return prisma.item.findMany({
    where: { OR: [{ name: contains }, { referenceCode: contains }, { aliases: { some: { name: contains } } }] },
    select: { id: true, name: true, referenceCode: true, itemType: { select: { name: true } }, aliases: { where: { name: contains }, select: { name: true }, take: 2 } },
    orderBy: { name: "asc" },
    take: 15,
  })
}

export type FilingItem = Awaited<ReturnType<typeof searchItemsForFiling>>[number]

// The item's requirements, lots and files, so the filing form works like the item's Files tab.
export const getItemFilingContext = async (itemId: string) => {
  const [documents, files] = await Promise.all([getItemDocuments(itemId), getAllItemFiles(itemId)])
  return { documents, files }
}

export const searchPurchaseOrdersForFiling = async (query: string, supplierId?: string | null) => {
  const q = query.trim()
  const digits = q.match(/^#?(\d+)$/)?.[1]
  return prisma.purchaseOrder.findMany({
    where: digits
      ? { referenceCode: Number(digits) }
      : q
        ? { supplier: { name: { contains: q, mode: "insensitive" } } }
        : supplierId ? { supplierId } : { id: "none" },
    select: { id: true, referenceCode: true, createdAt: true, supplier: { select: { name: true } }, status: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 15,
  })
}

export type FilingPurchaseOrder = Awaited<ReturnType<typeof searchPurchaseOrdersForFiling>>[number]

export const fileToItem = async (inboxDocumentId: string, itemId: string, details: ItemDocumentDetails, alsoReplace: string[]) =>
  run((userId) => fileInboxDocumentToItem({ userId, via: "user" }, inboxDocumentId, itemId, details, { alsoReplace }))

export const fileToPurchaseOrder = async (inboxDocumentId: string, purchaseOrderId: string, fileTypeId: string) =>
  run((userId) => fileInboxDocumentToPurchaseOrder({ userId, via: "user" }, inboxDocumentId, purchaseOrderId, fileTypeId))

export const dismissDocument = async (id: string, reason: string) => run((userId) => dismissInboxDocument(userId, id, reason))

export const restoreDocument = async (id: string) => run(() => restoreInboxDocument(id))

export const markChecked = async (id: string) => run((userId) => markInboxDocumentChecked(userId, id))

export const undoFiling = async (filingId: string) => run((userId) => undoInboxFiling(userId, filingId))
