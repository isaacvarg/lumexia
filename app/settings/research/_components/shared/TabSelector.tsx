'use client'

import TabButton from "./TabButton";

export type ResearchSettingsTab = 'overhead' | 'batchSizes'

const TabSelector = () => {

  const tabs: ResearchSettingsTab[] = ['overhead', 'batchSizes'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
