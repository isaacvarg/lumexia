'use client'
import { SinglePricingFinishedProduct } from '@/actions/accounting/examinations/getOne'
import SectionTitle from '@/components/Text/SectionTitle'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import React from 'react'

const FinishedProductsPanel = ({ finishedProducts }: { finishedProducts: SinglePricingFinishedProduct[] }) => {

  return (
    <div className='flex flex-col gap-6'>
      <SectionTitle>Finished Products</SectionTitle>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>

        {finishedProducts.map((fp) => {

          const { profitPercentage, profit } = fp;
          const isBad = profitPercentage < 25;

          return (
            <div
              key={fp.id}
              className='card bg-base-100 border border-base-300 shadow-sm'
            >
              <div className='card-body gap-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='card-title'>{fp.name}</h3>
                  <span className={`badge ${isBad ? 'badge-error' : 'badge-success'} badge-lg`}>
                    {toFracitonalDigits.pricingCurrency(profitPercentage)}%
                  </span>
                </div>

                <div className='stats stats-vertical lg:stats-horizontal w-full bg-base-200'>
                  <div className='stat'>
                    <div className='stat-title'>Website Price</div>
                    <div className='stat-value text-2xl'>
                      {toFracitonalDigits.pricingCurrency(fp.consumerPrice)}
                    </div>
                    <div className='stat-desc'>$/container</div>
                  </div>

                  <div className='stat'>
                    <div className='stat-title'>Cost</div>
                    <div className={`stat-value text-2xl ${isBad ? 'text-error' : ''}`}>
                      {toFracitonalDigits.pricingCurrency(fp.finishedProductTotalCost)}
                    </div>
                    <div className='stat-desc'>$/container</div>
                  </div>

                  <div className='stat'>
                    <div className='stat-title'>Profit</div>
                    <div className={`stat-value text-2xl ${isBad ? 'text-error' : 'text-success'}`}>
                      {toFracitonalDigits.pricingCurrency(profit)}
                    </div>
                    <div className='stat-desc'>per container</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

      </div>

    </div>
  )

}

export default FinishedProductsPanel
