import { ResearchSettingsTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TAB_LABELS: Record<ResearchSettingsTab, string> = {
  overhead: 'Overhead',
  batchSizes: 'Batch Sizes',
}

const TabButton = ({ tab }: { tab: ResearchSettingsTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const isSelected = activeTab.researchSettings === tab;

  return (
    <button
      className={`min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('researchSettings', tab)}
    >
      {TAB_LABELS[tab]}
    </button>
  )
}

export default TabButton
