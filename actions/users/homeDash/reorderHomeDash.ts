'use server'

import { getUserConfig } from "../getUserConfig"
import { updateUserConfig } from "../updateUserConfig"
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups"
import { PanelSpan, panelRegistry } from "@/app/_components/panels/registry"

const safeParse = (value: string): { enabled?: boolean; span?: PanelSpan; order?: number } => {
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

export const reorderHomeDash = async (orderedIds: string[]) => {

  await Promise.all(orderedIds.map(async (id, index) => {
    const entry = panelRegistry.find(p => p.id === id)
    if (!entry) return

    const existing = await getUserConfig(id)
    const current = existing ? safeParse(existing.value) : {}

    const next = {
      enabled: current.enabled ?? true,
      span: current.span ?? entry.defaultSpan,
      order: index,
    }

    await updateUserConfig(id, JSON.stringify(next), userConfigGroups.homedashtoggles)
  }))
}
