'use server'

import { getUserId } from "@/actions/users/getUserId"
import prisma from "@/lib/prisma"
import { createSurrogateDocument, SurrogateRefused } from "@/lib/itemDocuments/mutations"

// Other items' current documents of this type that could stand in for this item's own: not lot documents,
// not surrogates themselves.
export const findSurrogateCandidates = async (itemId: string, fileTypeId: string, query: string) => {
  const q = query.trim()
  return prisma.itemFile.findMany({
    where: {
      fileTypeId,
      itemId: { not: itemId },
      supersededAt: null,
      lotId: null,
      supplierLotNumber: null,
      surrogateForItemFileId: null,
      ...(q && {
        item: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { referenceCode: { contains: q, mode: "insensitive" } },
            { aliases: { some: { name: { contains: q, mode: "insensitive" } } } },
          ],
        },
      }),
    },
    select: {
      id: true,
      issuedAt: true,
      revision: true,
      item: { select: { id: true, name: true, referenceCode: true } },
      supplier: { select: { name: true } },
      file: { select: { name: true } },
    },
    orderBy: [{ item: { name: "asc" } }, { issuedAt: { sort: "desc", nulls: "last" } }],
    take: 25,
  })
}

export type SurrogateCandidate = Awaited<ReturnType<typeof findSurrogateCandidates>>[number]

export const addSurrogateDocument = async (itemId: string, sourceDocumentId: string, reason: string) => {
  try {
    await createSurrogateDocument({ userId: await getUserId() }, itemId, sourceDocumentId, reason)
    return { ok: true as const }
  } catch (error) {
    if (error instanceof SurrogateRefused) return { error: error.message }
    throw error
  }
}
