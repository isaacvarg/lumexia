'use client'

import TabButton from "./TabButton";

export type InventorySettingsTab = 'triggers' | 'configuration'

const TabSelector = () => {

  const tabs: InventorySettingsTab[] = ['triggers', 'configuration'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
