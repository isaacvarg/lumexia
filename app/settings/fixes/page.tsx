import { getMissingPricingData } from "./itemPricingData/getMissingPricingData"
import MissingPricingDataPanel from "./itemPricingData/MissingPricingDataPanel"
import { getMissingPoAccountingData } from "./poAccountingDetails/getMissingPoAccountingDetail"
import MissingPoAccountingDetailsPanel from "./poAccountingDetails/MissingPoAccountingDetailPanel"
import PoConsumptionsFixPanel from "./poConsumptions/PoConsumptionsFixPanel"

const FixesPage = async () => {

  const missingPricingData = await getMissingPricingData()
  const missingPoAccountingData = await getMissingPoAccountingData();

  return (
    <div className="flex flex-col gap-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <MissingPricingDataPanel missing={missingPricingData} />
        <MissingPoAccountingDetailsPanel missing={missingPoAccountingData} />

        <PoConsumptionsFixPanel />

      </div>



    </div>
  )
}

export default FixesPage
