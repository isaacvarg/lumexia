"use server"

import prisma from "@/lib/prisma"
import { s3 } from "@/lib/s3"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { appConfigGroups } from "@/configs/staticRecords/appConfigGroups"
import { CompanyImageKey, companyImageKeys } from "./companyImageKeys"

export type CompanyPdfImages = Record<CompanyImageKey, string | null>

// Resolves a stored fileId to a base64 data URI by fetching the object from S3
// server-side (avoids browser CORS to the internal S3 endpoint). Returns null
// if the file can't be found or read.
const resolveImage = async (fileId: string): Promise<string | null> => {
  const file = await prisma.file.findUnique({ where: { id: fileId } })
  if (!file) return null

  try {
    const res = await s3.send(
      new GetObjectCommand({ Bucket: file.bucketName, Key: file.objectName })
    )
    const bytes = await res.Body?.transformToByteArray()
    if (!bytes) return null
    const base64 = Buffer.from(bytes).toString('base64')
    return `data:${file.mimeType};base64,${base64}`
  } catch {
    return null
  }
}

// Returns the admin-configured PDF images as base64 data URIs ready for
// jsPDF.addImage. Any image that hasn't been uploaded resolves to null, and the
// generators omit it.
export const getCompanyPdfImages = async (): Promise<CompanyPdfImages> => {
  const configs = await prisma.config.findMany({
    where: { configGroupId: appConfigGroups.company },
  })
  const byKey = new Map(configs.map((c) => [c.key, c.value]))

  const entries = await Promise.all(
    (Object.keys(companyImageKeys) as CompanyImageKey[]).map(async (imageKey) => {
      const fileId = byKey.get(companyImageKeys[imageKey])
      const image = fileId ? await resolveImage(fileId) : null
      return [imageKey, image] as const
    })
  )

  return Object.fromEntries(entries) as CompanyPdfImages
}
