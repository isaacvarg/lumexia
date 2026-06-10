"use server"

import prisma from "@/lib/prisma"
import { appConfigGroups } from "@/configs/staticRecords/appConfigGroups"
import { getFileUrl } from "@/actions/files/getUrl"
import { CompanyImageKey, companyImageKeys } from "./companyImageKeys"

export type CompanyImageUrls = Record<CompanyImageKey, string | null>

// Returns presigned URLs for the configured company images, used to render
// previews in the Company Settings > Images tab. Null for any unset image.
export const getCompanyImageUrls = async (): Promise<CompanyImageUrls> => {
  const configs = await prisma.config.findMany({
    where: { configGroupId: appConfigGroups.company },
  })
  const byKey = new Map(configs.map((c) => [c.key, c.value]))

  const entries = await Promise.all(
    (Object.keys(companyImageKeys) as CompanyImageKey[]).map(async (imageKey) => {
      const fileId = byKey.get(companyImageKeys[imageKey])
      if (!fileId) return [imageKey, null] as const

      const file = await prisma.file.findUnique({ where: { id: fileId } })
      if (!file) return [imageKey, null] as const

      const url = await getFileUrl(file.bucketName, file.objectName)
      return [imageKey, url] as const
    })
  )

  return Object.fromEntries(entries) as CompanyImageUrls
}
