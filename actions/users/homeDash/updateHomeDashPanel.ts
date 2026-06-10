'use server'

import { getUserConfig } from "../getUserConfig"
import { updateUserConfig } from "../updateUserConfig"
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

export const updateHomeDashPanel = async (id: string, patch: PanelPatch) => {

  const index = panelRegistry.findIndex(p => p.id === id)
  if (index < 0) {
    throw new Error(`Unknown panel id: ${id}`)
  }
  const entry = panelRegistry[index]

  const existing = await getUserConfig(id)
  const current = existing ? safeParse(existing.value) : {}

  const next = {
    enabled: patch.enabled ?? current.enabled ?? true,
    span: patch.span ?? current.span ?? entry.defaultSpan,
    order: current.order ?? index,
  }

  await updateUserConfig(id, JSON.stringify(next), userConfigGroups.homedashtoggles)
}
