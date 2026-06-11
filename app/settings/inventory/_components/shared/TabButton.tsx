import { InventorySettingsTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TabButton = ({ tab }: { tab: InventorySettingsTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const isSelected = activeTab.inventorySettings === tab;

  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('inventorySettings', tab)}
    >
      {tab}
    </button>
  )
}

export default TabButton
