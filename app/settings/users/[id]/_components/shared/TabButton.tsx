import { UserAdminTab } from "./TabSelector";
import { useTabActions, useTabSelection } from "@/store/tabSlice";

const TabButton = ({ tab }: { tab: UserAdminTab }) => {

  const { setActiveTab } = useTabActions()
  const { activeTab } = useTabSelection()
  const isSelected = activeTab.userAdminDetails === tab;

  return (
    <button
      className={`capitalize min-w-40 btn btn-secondary ${isSelected ? '' : 'btn-dash'}  `}
      onClick={() => setActiveTab('userAdminDetails', tab)}
    >
      {tab}
    </button>
  )
}

export default TabButton
