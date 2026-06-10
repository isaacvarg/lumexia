"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { appConfigGroups } from "@/configs/staticRecords/appConfigGroups"
import { companyFieldKeys } from "@/app/settings/company/_components/companyFields"
import { getUser } from "@/actions/users/getUser"

// Admin-only: upsert the company config values (by key within the company group).
// Uses find + update/create rather than updateMany-by-id so keys that were never
// seeded are created on first save.
export const updateCompanyConfigs = async (values: Record<string, string>) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may edit company settings")
  }

  const existing = await prisma.config.findMany({
    where: { configGroupId: appConfigGroups.company },
  })
  const byKey = new Map(existing.map(config => [config.key, config]))

  await prisma.$transaction(
    companyFieldKeys.map((key) => {
      const value = values[key] ?? ''
      const current = byKey.get(key)

      if (current) {
        return prisma.config.update({
          where: { id: current.id },
          data: { value },
        })
      }

      return prisma.config.create({
        data: {
          key,
          value,
          dataType: 'string',
          description: '',
          configGroupId: appConfigGroups.company,
        },
      })
    })
  )

  revalidatePath('/settings/company')
}
