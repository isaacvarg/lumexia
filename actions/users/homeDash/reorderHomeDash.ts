'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "../getUserId"
import { getUser } from "../getUser"
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups"
import { PanelSpan, panelRegistry } from "@/app/_components/panels/registry"

const safeParse = (value: string): { enabled?: boolean; span?: PanelSpan; order?: number } => {
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

const resolveUserId = async (targetUserId?: string) => {
  if (!targetUserId) return getUserId()
  const admin = await getUser()
  if (!admin.roles.isSystemAdmin) {
    throw new Error("Forbidden: only system admins may edit another user's dashboard")
  }
  return targetUserId
}

// Persists a new panel ordering by writing each panel's index into its
// homedashtoggles config, preserving the panel's existing enabled/span.
export const reorderHomeDash = async (orderedIds: string[], targetUserId?: string) => {

  const userId = await resolveUserId(targetUserId)

  await Promise.all(orderedIds.map(async (id, index) => {
    const entry = panelRegistry.find(p => p.id === id)
    if (!entry) return

    const existing = await prisma.userConfig.findFirst({
      where: { userId, name: id },
    })
    const current = existing ? safeParse(existing.value) : {}

    const next = {
      enabled: current.enabled ?? true,
      span: current.span ?? entry.defaultSpan,
      order: index,
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
  }))
}
