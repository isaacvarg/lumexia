import { CanonSettingsTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TAB_LABELS: Record<CanonSettingsTab, string> = {
  dataTypes: 'Data Types',
  groups: 'Groups',
  teams: 'Teams',
}

const TabButton = ({ tab }: { tab: CanonSettingsTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const isSelected = activeTab.canonSettings === tab;

  return (
    <button
      className={`min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('canonSettings', tab)}
    >
      {TAB_LABELS[tab]}
    </button>
  )
}

export default TabButton
