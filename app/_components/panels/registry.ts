import { ComponentType } from "react"
import Items from "./items/Items"
import Links from "./links/Links"
import Pricing from "./pricing/Pricing"
import Receivables from "./receivables/Receivables"
import Requests from "./requests/Requests"
import UniversalScanner from "./scanner/UniversalScanner"
import Welcome from "./welcome/Welcome"

export type PanelSpan = 1 | 2 | 3

export type PanelRegistryEntry = {
  id: string
  label: string
  Component: ComponentType
  defaultSpan: PanelSpan
}

// defaults for panels
export const panelRegistry: PanelRegistryEntry[] = [
  { id: 'scanner', label: 'Universal Scanner', Component: UniversalScanner, defaultSpan: 1 },
  { id: 'requests', label: 'New Requests', Component: Requests, defaultSpan: 1 },
  { id: 'pricing', label: 'Reviewable Pricing', Component: Pricing, defaultSpan: 1 },
  { id: 'welcome', label: 'Dashboard Update', Component: Welcome, defaultSpan: 1 },
  { id: 'receivables', label: 'Receivable POs', Component: Receivables, defaultSpan: 2 },
  { id: 'items', label: 'Items', Component: Items, defaultSpan: 1 },
  { id: 'links', label: 'Quick Links', Component: Links, defaultSpan: 1 },
]

export type PanelId = typeof panelRegistry[number]['id']

export const getPanelEntry = (id: string) => panelRegistry.find(p => p.id === id)
