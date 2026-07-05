import SectionTitle from "@/components/Text/SectionTitle"
import FilterModeButtons from "./FilterModeButtons"
import { useItemSelection } from "@/store/itemSlice"
import PurchasesCount from "./PurchasesCount"
import QuantityTotal from "./QuantityTotal"
import PurchasesTotal from "./PurchasesTotal"
import Stats from "./Stats"
import FrequencyChart from "./FrequencyChart"

const Trends = () => {


  return (

    <div className="flex flex-col gap-4">

      <div className="flex justify-between items-center">
        <SectionTitle>Trends</SectionTitle>

        <FilterModeButtons />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

        <PurchasesCount />
        <QuantityTotal />
        <PurchasesTotal />
        <Stats />
        <FrequencyChart />



      </div>


    </div>
  )
}

export default Trends
