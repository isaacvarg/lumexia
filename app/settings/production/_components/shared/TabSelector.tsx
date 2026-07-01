'use client'

import TabButton from "./TabButton";

export type ProductionSettingsTab = 'equipment' | 'vessels' | 'actionables'

const TabSelector = () => {

  const tabs: ProductionSettingsTab[] = ['equipment', 'vessels', 'actionables'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
