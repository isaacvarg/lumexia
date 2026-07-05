import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import DataCard from "./dataCards/DataCard"
import DataCardText from "./dataCards/DataCardText"
import { ProcessedFinishedProduct, usePricingSharedSelection } from "@/store/pricingSharedSlice"
import { useEffect, useState } from "react"
import Card from "@/components/Card"
import Contributions from "./Contributions"

const Outputs = () => {

  const { processedFinishedProducts, selectedFinishedProduct } = usePricingSharedSelection()
  const [processedProduct, setProcessedProduct] = useState<ProcessedFinishedProduct>({ consumerPrice: 0, profit: 0, profitPercentage: 0, markup: 0, valid: false })


  useEffect(() => {

    if (!selectedFinishedProduct) return;

    const product = processedFinishedProducts.get(selectedFinishedProduct.id);

    if (!product) return;

    setProcessedProduct(product)

  })


  if (!selectedFinishedProduct) return false;



  return (
    <div className="flex flex-col gap-6">

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DataCard>
          <DataCardText size='small' color='light'>Filled Container Cost</DataCardText>
          <div className="tooltip" data-tip="You can see more details on how this number was calculated by using the toggle below.">
            <DataCardText>{toFracitonalDigits.pricingCurrency(selectedFinishedProduct.calculatedTotals.finishedProductTotalCost)}</DataCardText>
            <DataCardText size='tiny' color='light'>$ / container</DataCardText>
          </div>
        </DataCard>

        <DataCard>
          <div className='tooltip' data-tip="Markup % = [(Consumer Price - Overall Container Cost )/ Overall Container Cost ] * 100">
            <DataCardText size='small' color='light'>Consumer Price</DataCardText>
            <DataCardText>$ {toFracitonalDigits.pricingCurrency(processedProduct.consumerPrice)}</DataCardText>
            <DataCardText size='tiny' color='light'>{toFracitonalDigits.pricingCurrency(processedProduct.markup)} % markup</DataCardText>
          </div>
        </DataCard>

        <DataCard>
          <DataCardText size='small' color='light'>Profit</DataCardText>
          <DataCardText>{toFracitonalDigits.pricingCurrency(processedProduct.profit)}</DataCardText>
          <DataCardText size='tiny' color='light'>{toFracitonalDigits.pricingCurrency(processedProduct.profitPercentage)} % profit margin</DataCardText>
        </DataCard>
      </div>


      <div className="flex flex-col gap-y-6">

        <Card.Root>

          <Card.Title>Filled Container</Card.Title>

          <Contributions />
        </Card.Root>


      </div>





    </div>
  )
}

export default Outputs
