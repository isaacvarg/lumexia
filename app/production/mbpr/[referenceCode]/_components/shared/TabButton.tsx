import { MbprTab } from "./TabSelector";
import { useMbprDetailsActions, useMbprDetailsSelection } from "@/store/mbprDetailsSlice";

const TabButton = ({ tab }: { tab: MbprTab }) => {

  const { setCurrentTab } = useMbprDetailsActions()
  const { currentTab } = useMbprDetailsSelection()
  const isSelected = currentTab === tab;

  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setCurrentTab(tab)}
    >
      {tab === 'rnd' ? 'R&D' : tab}
    </button>
  )
}

export default TabButton
