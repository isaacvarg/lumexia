"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { appConfigGroups } from "@/configs/staticRecords/appConfigGroups"
import { getUser } from "@/actions/users/getUser"
import { CompanyImageKey, companyImageKeys } from "./companyImageKeys"

// Admin-only: upsert the fileId for a single company image (logo / micro form
// template / signature) within the company config group. Mirrors the upsert
// pattern in updateCompanyConfigs so a never-seeded key is created on first save.
export const updateCompanyImage = async (imageKey: CompanyImageKey, fileId: string) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may edit company settings")
  }

  const key = companyImageKeys[imageKey]

  const current = await prisma.config.findFirst({
    where: { configGroupId: appConfigGroups.company, key },
  })

  if (current) {
    await prisma.config.update({ where: { id: current.id }, data: { value: fileId } })
  } else {
    await prisma.config.create({
      data: {
        key,
        value: fileId,
        dataType: 'string',
        description: '',
        configGroupId: appConfigGroups.company,
      },
    })
  }

  revalidatePath('/settings/company')
}
