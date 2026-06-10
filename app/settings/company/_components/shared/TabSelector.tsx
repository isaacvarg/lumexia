'use client'

import TabButton from "./TabButton";

export type CompanySettingsTab = 'info' | 'images'

const TabSelector = () => {

  const tabs: CompanySettingsTab[] = ['info', 'images'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
