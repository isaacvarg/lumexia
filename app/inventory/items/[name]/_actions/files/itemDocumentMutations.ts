'use server'

import { getUserId } from "@/actions/users/getUserId"
import * as documents from "@/lib/itemDocuments/mutations"
import { ItemDocumentDetails } from "@/lib/itemDocuments/mutations"

export type { ItemDocumentDetails }

export const createItemDocuments = async (
  itemId: string,
  files: { fileId: string; name: string }[],
  details: ItemDocumentDetails,
  alsoReplace: string[] = []
) => {
  await documents.createItemDocuments({ userId: await getUserId() }, itemId, files, details, alsoReplace)
}

export const updateItemDocument = async (itemFileId: string, details: ItemDocumentDetails) => {
  await documents.updateItemDocument({ userId: await getUserId() }, itemFileId, details)
}

export const setItemDocumentReplaced = async (itemFileId: string, replaced: boolean) => {
  await documents.setItemDocumentReplaced({ userId: await getUserId() }, itemFileId, replaced)
}
