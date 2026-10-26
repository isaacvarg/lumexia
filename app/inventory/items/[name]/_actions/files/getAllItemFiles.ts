'use server'

import { fileActions } from "@/actions/files"
import prisma from "@/lib/prisma"

export const getAllItemFiles = async (itemId: string) => {
  const files = await prisma.itemFile.findMany({
    where: {
      itemId,
    },
    include: {
      fileType: true,
      lot: { select: { id: true, lotNumber: true } },
      supplier: { select: { id: true, name: true } },
      // another item's document this one stands in for, and the items using this one that way
      surrogateFor: { select: { id: true, supersededAt: true, item: { select: { id: true, name: true } } } },
      surrogates: { where: { supersededAt: null }, select: { id: true, item: { select: { id: true, name: true } } } },
      file: {
        include: {
          uploadedBy: true,
          fileTags: {
            include: { tag: true },
            orderBy: { createdAt: "asc" },
          },
        }
      }
    },
    orderBy: [{ issuedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  })

  const transformedData = await Promise.all(files.map(async (file) => {
    const url = await fileActions.getUrl(file.file.bucketName, file.file.objectName);
    const thumbnailUrl = file.file.thumbnailObjectName && file.file.thumbnailBucketName
      ? await fileActions.getUrl(file.file.thumbnailBucketName, file.file.thumbnailObjectName)
      : undefined;

    return {
      ...file,
      url,
      thumbnailUrl,
    }
  }))

  return transformedData;

}

export type ItemFile = Awaited<ReturnType<typeof getAllItemFiles>>[number]
