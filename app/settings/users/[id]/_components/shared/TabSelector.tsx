'use client'

import { useEffect } from "react";
import { useTabActions, useTabSelection } from "@/store/tabSlice";
import TabButton from "./TabButton";

export type UserAdminTab = 'profile' | 'status' | 'dashboard' | 'agents' | 'danger'

// Agents and the system user only show the tabs that apply to them.
const TabSelector = ({ tabs }: { tabs: UserAdminTab[] }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()

  // The selected tab is remembered across users; reset it when this user doesn't have it.
  useEffect(() => {
    if (!activeTab.userAdminDetails || !tabs.includes(activeTab.userAdminDetails)) setActiveTab('userAdminDetails', 'profile')
  }, [tabs, activeTab.userAdminDetails, setActiveTab])

  return (
    <div className="flex items-center justify-start gap-6">
      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

export default TabSelector
