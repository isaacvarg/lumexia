'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "../getUserId"
import { getUser } from "../getUser"
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups"
import { PanelSpan, panelRegistry } from "@/app/_components/panels/registry"

type PanelPatch = {
  enabled?: boolean
  span?: PanelSpan
}

const safeParse = (value: string): { enabled?: boolean; span?: PanelSpan; order?: number } => {
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

// Resolves the effective user: own session by default, or a target user when an
// admin edits someone else's dashboard (in which case admin access is required).
const resolveUserId = async (targetUserId?: string) => {
  if (!targetUserId) return getUserId()
  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may edit another user's dashboard")
  }
  return targetUserId
}

// Upserts one panel's homedashtoggles config (keyed by userId + panel name),
// merging the patch over the existing stored value or registry defaults.
export const updateHomeDashPanel = async (id: string, patch: PanelPatch, targetUserId?: string) => {

  const index = panelRegistry.findIndex(p => p.id === id)
  if (index < 0) {
    throw new Error(`Unknown panel id: ${id}`)
  }
  const entry = panelRegistry[index]

  const userId = await resolveUserId(targetUserId)

  const existing = await prisma.userConfig.findFirst({
    where: { userId, name: id },
  })
  const current = existing ? safeParse(existing.value) : {}

  const next = {
    enabled: patch.enabled ?? current.enabled ?? true,
    span: patch.span ?? current.span ?? entry.defaultSpan,
    order: current.order ?? index,
  }

  if (existing) {
    await prisma.userConfig.update({
      where: { id: existing.id },
      data: { value: JSON.stringify(next) },
    })
    return
  }

  await prisma.userConfig.create({
    data: {
      userId,
      configGroupId: userConfigGroups.homedashtoggles,
      name: id,
      value: JSON.stringify(next),
    },
  })
}
