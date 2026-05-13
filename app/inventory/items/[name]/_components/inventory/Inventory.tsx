import Audits from "./Audits"
import DiscreteConversions from "./DiscreteConversions"
import InventoryAmounts from "./InventoryAmounts"
import Lots from "./Lots"
import ReorderingRule from "./ReorderingRule"

const Inventory = () => {

  return (
    <div className="grid grid-cols-3 gap-6">

      <InventoryAmounts />

      <Lots />

      <div className="grid grid-cols-2 gap-6 col-span-3">
        <Audits />

        <DiscreteConversions />

      </div>

      <div className="col-span-3">
        <ReorderingRule />
      </div>

    </div>
  )
}

export default Inventory
