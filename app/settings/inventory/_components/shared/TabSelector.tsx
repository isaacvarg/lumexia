'use client'

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTabActions } from "@/store/tabSlice";
import TabButton from "./TabButton";

export type InventorySettingsTab = 'triggers' | 'configuration' | 'documents' | 'units'

const tabs: InventorySettingsTab[] = ['triggers', 'configuration', 'documents', 'units'];

const TabSelector = () => {
  const { setActiveTab } = useTabActions()
  // links like /settings/inventory?tab=documents open that tab
  const requested = useSearchParams().get('tab') as InventorySettingsTab | null

  useEffect(() => {
    if (requested && tabs.includes(requested)) setActiveTab('inventorySettings', requested)
  }, [requested, setActiveTab])

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
