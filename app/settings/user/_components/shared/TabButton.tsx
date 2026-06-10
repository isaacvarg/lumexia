import { UserSettingsTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TabButton = ({ tab }: { tab: UserSettingsTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const isSelected = activeTab.userSettings === tab;


  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('userSettings', tab)}
    >
      {tab}
    </button>
  )
}

export default TabButton
