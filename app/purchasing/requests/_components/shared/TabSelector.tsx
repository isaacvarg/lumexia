'use client'

import TabButton from "./TabButton";

export type RequestTab = 'new' | 'status' | 'supplier' | 'calendar'

const TabSelector = () => {

  const tabs: RequestTab[] = ['new', 'status', 'supplier', 'calendar'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

const Skeleton = () => {
  return (
    <div className="flex items-center justify-start gap-x-6">
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
    </div>
  )
}

export default TabSelector
