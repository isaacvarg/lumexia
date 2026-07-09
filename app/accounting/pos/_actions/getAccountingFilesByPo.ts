'use server'
import prisma from "@/lib/prisma"
import { getFileUrl } from "@/actions/files/getUrl"

export const getAccountingFilesByPo = async (poId: string) => {

  const filesFromDb = await prisma.poAccountingFile.findMany({
    where: {
      purchaseOrderId: poId,
    },
    include: {
      file: {
        include: {
          uploadedBy: true
        }
      },
      fileType: true
    }
  });

  // presign url
  const filesWithUrls = await Promise.all(
    filesFromDb.map(async (poFile) => {
      const url = await getFileUrl(poFile.file.bucketName, poFile.file.objectName);

      const thumbnailUrl = (poFile.file.thumbnailBucketName && poFile.file.thumbnailObjectName) ?
        await getFileUrl(poFile.file.thumbnailBucketName, poFile.file.thumbnailObjectName) :
        null

      return {
        ...poFile,
        url: url,
        thumbnailUrl: thumbnailUrl,
      };
    })
  );

  return filesWithUrls;
}

export type AccountingFile = Awaited<ReturnType<typeof getAccountingFilesByPo>>[number]

// TODO move this to a universal area
export type FileWithThumbnail = Awaited<ReturnType<typeof getAccountingFilesByPo>>[number]

