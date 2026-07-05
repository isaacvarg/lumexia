"use client"

import { usePricingSharedSelection } from "@/store/pricingSharedSlice"
import PurchasedBasics from "./PurchasedBasics"
import TotalCostPerLbPurchased from "./TotalCostPerLbPurchased"
import ProducedBasics from "./ProducedBasics"
import TotalCostPerLbProduced from "./TotalCostPerLbProduced"

const BasicsPanels = () => {

  const { isProduced } = usePricingSharedSelection()
  const layout = isProduced ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';


  return (
    <div
      className={`grid ${layout} gap-6`}
    >

      {!isProduced && <PurchasedBasics />}

      {!isProduced && <TotalCostPerLbPurchased />}

      {isProduced && <ProducedBasics />}

      {isProduced && <TotalCostPerLbProduced />}

    </div>
  )
}

export default BasicsPanels
