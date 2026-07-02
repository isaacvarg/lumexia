import { useItemActions, useItemSelection } from "@/store/itemSlice"
import { ItemTab } from "./TabSelector"
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TabButton = ({ tab }: { tab: ItemTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()

  const isSelected = activeTab['itemDetails'] === tab;

  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('itemDetails', tab)}
    >
      {tab === 'rnd' ? 'R&D' : tab}
    </button>
  )
}

export default TabButton
