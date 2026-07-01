import { ProductionSettingsTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TabButton = ({ tab }: { tab: ProductionSettingsTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const isSelected = activeTab.productionSettings === tab;

  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('productionSettings', tab)}
    >
      {tab}
    </button>
  )
}

export default TabButton
