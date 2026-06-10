'use client'

import TabButton from "./TabButton";

export type UserAdminTab = 'profile' | 'status' | 'dashboard' | 'danger'

const TabSelector = () => {

  const tabs: UserAdminTab[] = ['profile', 'status', 'dashboard', 'danger'];

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
