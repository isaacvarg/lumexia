'use client'
import { useCallback, useState } from "react"
import AlterModeButton, { AlterMode } from "./AlterModeButton"
import validator from "validator"
import { ProcessedFinishedProduct, usePricingSharedActions, usePricingSharedSelection } from "@/store/pricingSharedSlice"
import { getMarkup } from "../../../_calculations/getMarkup"
import { getProfit } from "../../../_calculations/getProfit"
import { getProfitPercentage } from "../../../_calculations/getProfitPercentage"
import { getConsumerPrice } from "../../../_calculations/getConsumerPrice"
import { PricingError } from "@/utils/errors/PricingError"



const PriceAltering = () => {

  const { selectedFinishedProduct, processedFinishedProducts } = usePricingSharedSelection()
  const { setProcessedFinishedProduct } = usePricingSharedActions()
  const [alterMode, setAlterMode] = useState<AlterMode>("consumerPrice")


  const getValueByAlterMode = () => {

    if (!selectedFinishedProduct) {
      throw new PricingError('NULL_REFERENCE', 'There is no selected finished product')
    }

    const processed = processedFinishedProducts.get(selectedFinishedProduct.id)

    if (!processed) {
      return;
    }

    switch (alterMode) {
      case 'consumerPrice':
        return processed.consumerPrice;
      case 'markup':
        return processed.markup;
      case 'profit':
        return processed.profit;
      default:
        return processed.profitPercentage;
    }
  };


  const updatePricingCalculations = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {

    if (!selectedFinishedProduct) return;

    const value = validator.isEmpty(event.target.value) ? 0 : parseFloat(event.target.value);
    const finishedProductTotalCost = selectedFinishedProduct.calculatedTotals.finishedProductTotalCost

    let cp = 0; // consumer price
    let m = 0; // markup
    let p = 0; // profit
    let pp = 0; // profit percentage

    switch (alterMode) {
      case 'consumerPrice': {
        cp = value;
        m = getMarkup(finishedProductTotalCost, cp);
        p = getProfit(finishedProductTotalCost, cp);
        pp = getProfitPercentage(finishedProductTotalCost, cp);
        break;
      }
      case 'markup': {
        m = value;
        cp = getConsumerPrice(finishedProductTotalCost, m);
        p = getProfit(finishedProductTotalCost, cp);
        pp = getProfitPercentage(finishedProductTotalCost, cp);
        break;
      }
      case 'profit': {
        p = value;
        cp = p + finishedProductTotalCost;
        pp = getProfitPercentage(finishedProductTotalCost, cp);
        m = getMarkup(finishedProductTotalCost, cp);
        break;
      }
      case 'profitPercentage': {
        pp = value;
        cp = (finishedProductTotalCost / (1 - (pp / 100)));
        p = cp - finishedProductTotalCost
        m = getMarkup(finishedProductTotalCost, cp);
        break;
      }
      default:
        break;
    }

    const data: ProcessedFinishedProduct = {
      consumerPrice: cp,
      profit: p,
      markup: m,
      profitPercentage: pp,
      valid: pp > 15,
    }

    setProcessedFinishedProduct(selectedFinishedProduct.id, data)

    //  // Update states
    //  setConsumerPrice(cp);
    //  setMarkup(m);
    //  setProfit(p);
    //  setProfitPercentage(pp);

    //  // update zustand
    //  const interimPayload = {
    //    finishedProductId: selectedFinishedProduct.id,
    //    finishedProduct: selectedFinishedProduct,
    //    consumerPrice: cp,
    //    profit: p,
    //    markup: m,
    //    wasViewed: true,
    //    profitPercentage: pp

    //  }
    //  updateInterimFinishedProduct(interimPayload);

  }, [alterMode, selectedFinishedProduct]);




  return (
    <div className="flex flex-col gap-4">
      <div className='flex flex-col gap-4'>
        <h1 className='font-poppins text-xl font-semibold'>
          Alter By
        </h1>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          <AlterModeButton alterModeId='consumerPrice' currentMode={alterMode} label='Consumer Price' onSelect={setAlterMode} />
          <AlterModeButton alterModeId='markup' currentMode={alterMode} label='Markup Percentage' onSelect={setAlterMode} />
          <AlterModeButton alterModeId='profit' currentMode={alterMode} label='Profit' onSelect={setAlterMode} />
          <AlterModeButton alterModeId='profitPercentage' currentMode={alterMode} label='Profit Margin' onSelect={setAlterMode} />
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <h1 className='font-poppins text-xl font-semibold'>
          Value
        </h1>

        <input
          type='number'
          value={getValueByAlterMode()}
          onChange={updatePricingCalculations}
          className='input input-primary input-xl w-full p-4 flex items-center justify-center font-poppins text-2xl font-medium text-center rounded-xl'
          step={alterMode === 'consumerPrice' || alterMode === 'profit' ? '0.01' : '0.1'}
        />
      </div>
    </div>
  )
}

export default PriceAltering
