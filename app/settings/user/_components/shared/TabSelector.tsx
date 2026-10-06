'use client'

import TabButton from "./TabButton";

export type UserSettingsTab = 'main' | 'dashboard' | 'agents'

const TabSelector = () => {

  const tabs: UserSettingsTab[] = ['main', 'dashboard', 'agents'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
