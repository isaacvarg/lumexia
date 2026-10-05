'use client'
import { useTabActions, useTabSelection } from "@/store/tabSlice";

export type CanonDashboardTab = 'attention' | 'requests' | 'coverage' | 'activity'

const TAB_LABELS: Record<CanonDashboardTab, string> = {
  attention: 'Needs Attention',
  requests: 'Change Requests',
  coverage: 'Coverage',
  activity: 'Activity',
}

const TabSelector = ({ counts }: { counts: Partial<Record<CanonDashboardTab, number>> }) => {
  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const tabs = Object.keys(TAB_LABELS) as CanonDashboardTab[]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`flex-1 min-w-[8rem] sm:flex-none sm:min-w-40 btn btn-secondary ${activeTab.canonDashboard === tab ? '' : 'btn-dash'}`}
          onClick={() => setActiveTab('canonDashboard', tab)}
        >
          {TAB_LABELS[tab]}
          {!!counts[tab] && <span className="badge badge-sm">{counts[tab]}</span>}
        </button>
      ))}
    </div>
  )
}

export default TabSelector
