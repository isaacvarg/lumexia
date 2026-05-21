"use server"

import prisma from "@/lib/prisma"

const GROUP_NAME = 'inventoryAudits'
const GROUP_DESCRIPTION = 'Thresholds and toggles for the weekly inventory audit trigger cron'

type ConfigSeed = {
  key: string
  value: string
  dataType: 'boolean' | 'number'
  description: string
}

const CONFIG_SEEDS: ConfigSeed[] = [
  {
    key: 'auditTriggerLowOnHandEnabled',
    value: 'true',
    dataType: 'boolean',
    description: 'Trigger audits when a lot drops below the on-hand ratio with no active reordering rule.',
  },
  {
    key: 'auditTriggerLowOnHandRatio',
    value: '0.05',
    dataType: 'number',
    description: 'On-hand / initial-quantity ratio below which the low-on-hand check fires (e.g. 0.05 = 5%).',
  },
  {
    key: 'auditTriggerBprUsageEnabled',
    value: 'true',
    dataType: 'boolean',
    description: 'Trigger audits when an item is consumed by more than the configured number of BPRs.',
  },
  {
    key: 'auditTriggerBprUsageThreshold',
    value: '2',
    dataType: 'number',
    description: 'Maximum number of distinct BPRs an item can appear in before the BPR-usage check fires.',
  },
  {
    key: 'auditTriggerNegativeStockEnabled',
    value: 'true',
    dataType: 'boolean',
    description: 'Trigger audits when any lot has a negative on-hand quantity.',
  },
]

const parseBoolean = (raw: string | undefined, fallback: boolean) => {
  if (raw === undefined) return fallback
  return raw.trim().toLowerCase() === 'true'
}

const parseNumber = (raw: string | undefined, fallback: number) => {
  if (raw === undefined) return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export const ensureInventoryAuditConfigs = async () => {
  let group = await prisma.appConfigGroup.findFirst({ where: { name: GROUP_NAME } })
  if (!group) {
    group = await prisma.appConfigGroup.create({
      data: { name: GROUP_NAME, description: GROUP_DESCRIPTION },
    })
  }

  const existing = await prisma.config.findMany({
    where: { configGroupId: group.id },
  })
  const byKey = new Map(existing.map((c) => [c.key, c]))

  const missing = CONFIG_SEEDS.filter((s) => !byKey.has(s.key))
  if (missing.length > 0) {
    await prisma.config.createMany({
      data: missing.map((s) => ({
        key: s.key,
        value: s.value,
        dataType: s.dataType,
        description: s.description,
        configGroupId: group!.id,
      })),
    })
  }

  return prisma.config.findMany({
    where: { configGroupId: group.id },
    orderBy: { key: 'asc' },
  })
}

export const getInventoryAuditConfig = async () => {
  const configs = await ensureInventoryAuditConfigs()
  const map = new Map(configs.map((c) => [c.key, c.value]))

  return {
    lowOnHand: {
      enabled: parseBoolean(map.get('auditTriggerLowOnHandEnabled'), true),
      ratio: parseNumber(map.get('auditTriggerLowOnHandRatio'), 0.05),
    },
    bprUsage: {
      enabled: parseBoolean(map.get('auditTriggerBprUsageEnabled'), true),
      threshold: parseNumber(map.get('auditTriggerBprUsageThreshold'), 2),
    },
    negativeStock: {
      enabled: parseBoolean(map.get('auditTriggerNegativeStockEnabled'), true),
    },
  }
}
