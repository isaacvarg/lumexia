'use server'
import { s3 } from "@/lib/s3"
import prisma from "@/lib/prisma"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

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
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: poFile.file.bucketName, Key: poFile.file.objectName }),
        { expiresIn: 3600 }
      );

      const thumbnailUrl = (poFile.file.thumbnailBucketName && poFile.file.thumbnailObjectName) ?
        await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: poFile.file.thumbnailBucketName, Key: poFile.file.thumbnailObjectName }),
          { expiresIn: 3600 }
        ) :
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

