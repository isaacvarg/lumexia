"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/actions/users/getUser"

const GROUP_NAME = 'purchasing'
const GROUP_DESCRIPTION = 'Purchasing configuration (global PO notes)'

const GLOBAL_PO_NOTES_KEY = 'globalPoNotes'

// previously hardcoded in the PO PDF generator; seeded so PDFs are unchanged until edited
const DEFAULT_GLOBAL_PO_NOTES = [
  'Receiving Hours: Monday - Thursday: 8:00 a.m. - 4:00 p.m. PST.',
  'Closed Friday through Sunday and all major holidays.',
]

// self-seeding (like ensureInventoryAuditConfigs) because configs/staticRecords is
// generated per environment and may not contain the purchasing group yet
export const ensurePurchasingConfigs = async () => {
  let group = await prisma.appConfigGroup.findFirst({ where: { name: GROUP_NAME } })
  if (!group) {
    group = await prisma.appConfigGroup.create({
      data: { name: GROUP_NAME, description: GROUP_DESCRIPTION },
    })
  }

  const existing = await prisma.config.findFirst({
    where: { configGroupId: group.id, key: GLOBAL_PO_NOTES_KEY },
  })
  if (existing) return existing

  return prisma.config.create({
    data: {
      key: GLOBAL_PO_NOTES_KEY,
      value: JSON.stringify(DEFAULT_GLOBAL_PO_NOTES),
      dataType: 'json',
      description: 'Notes printed on every purchase order PDF, before PO-specific and supplier notes.',
      configGroupId: group.id,
    },
  })
}

const parseNotes = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n): n is string => typeof n === 'string') : []
  } catch {
    return []
  }
}

export const getGlobalPoNotes = async (): Promise<string[]> => {
  const config = await ensurePurchasingConfigs()
  return parseNotes(config.value)
}

export const updateGlobalPoNotes = async (notes: string[]) => {

  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may edit purchasing settings")
  }

  const cleaned = notes.map(note => note.trim()).filter(note => note.length > 0)
  const config = await ensurePurchasingConfigs()

  await prisma.config.update({
    where: { id: config.id },
    data: { value: JSON.stringify(cleaned) },
  })

  revalidatePath('/settings/purchasing')
}
