import Audits from "./Audits"
import DiscreteConversions from "./DiscreteConversions"
import InventoryAmounts from "./InventoryAmounts"
import Lots from "./Lots"
import ReorderingRule from "./ReorderingRule"

const Inventory = () => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      <InventoryAmounts />

      <Lots />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-1 sm:col-span-2 lg:col-span-3">
        <Audits />

        <DiscreteConversions />

      </div>

      <div className="col-span-1 sm:col-span-2 lg:col-span-3">
        <ReorderingRule />
      </div>

    </div>
  )
}

export default Inventory
