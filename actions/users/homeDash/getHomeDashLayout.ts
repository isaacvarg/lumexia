'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "../getUserId"
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups"
import { panelRegistry, PanelSpan } from "@/app/_components/panels/registry"

export type HomeDashPanel = {
  id: string
  label: string
  enabled: boolean
  span: PanelSpan
  order: number
}

type StoredPanelConfig = {
  enabled?: boolean
  span?: PanelSpan
  order?: number
}

const parseConfig = (value: string): StoredPanelConfig => {
  try {
    return JSON.parse(value) as StoredPanelConfig
  } catch {
    return {}
  }
}

export const getHomeDashLayout = async (targetUserId?: string): Promise<HomeDashPanel[]> => {

  const userId = targetUserId ?? await getUserId()

  const rows = await prisma.userConfig.findMany({
    where: {
      userId,
      configGroupId: userConfigGroups.homedashtoggles,
    },
  })

  const byId = new Map(rows.map(r => [r.name, parseConfig(r.value)]))

  return panelRegistry
    .map((entry, index) => {
      const stored = byId.get(entry.id) ?? {}
      return {
        id: entry.id,
        label: entry.label,
        enabled: stored.enabled ?? true,
        span: stored.span ?? entry.defaultSpan,
        order: stored.order ?? index,
      }
    })
    .sort((a, b) => a.order - b.order)
}
