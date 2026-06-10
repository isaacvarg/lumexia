"use client"
import React from 'react'
import { InventorySnapshot } from '../_functions/getInventorySnapshot'
import Text from '@/components/Text'
import { SnapshotBpr } from '../_functions/getSnapshotBprs'
import { SnapshotPo } from '../_functions/getSnapshotPos'

const InventorySnapshotTab = ({ snapshot, bprs, pos }: { snapshot: InventorySnapshot, bprs: SnapshotBpr[], pos: SnapshotPo[] }) => {

  return (
    <div className='flex flex-col gap-y-4 '>
      <p>The inventory at the time the request was created.</p>

      <div className='grid grid-cols-2 gap-4'>

        <div className='card bg-base-200'>

          <div className='card-body'>

            <div className='card-title'>Info</div>


            <div className='flex flex-col gap-y-2'>
              <Text.LabelDataPair label='On Hand' data={`${snapshot.onHandQuantity} lbs`} />
              <Text.LabelDataPair label='Allocated' data={`${snapshot.allocatedQuantity} lbs`} />
              <Text.LabelDataPair label='Available' data={`${snapshot.availableQuantity} lbs`} />
              <Text.LabelDataPair label='Warning Shown' data={snapshot.warningShown.toString()} />
              <Text.LabelDataPair label='Warning Overridden' data={snapshot.warningOverridden.toString()} />
            </div>
          </div>
        </div>

        <div className='card bg-base-200'>

          <div className='card-body'>

            <div className='card-title'>Allocated Bprs</div>

            <div className='grid grid-cols-2 gap-2'>
              {bprs.map((bpr) => {
                return (
                  <div key={bpr?.id} className='card bg-accent/40'>
                    <div className='card-body'>
                      <h2 className='font-semibold'>{bpr?.referenceCode}</h2>
                      <h2 className=''>{bpr?.mbpr.producesItem.name}</h2>

                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>

        <div className='card bg-base-200'>

          <div className='card-body'>

            <div className='card-title'>Pending Purchse Orders</div>

            <div className='grid grid-cols-2 gap-2'>
              {pos.map((po) => {
                return (
                  <div key={po?.id} className='card bg-base-100 border border-base-300'>
                    <div className='card-body'>
                      <h2 className='font-semibold text-xl'>{po?.referenceCode}</h2>
                      <h2 className=' text-xl'>{po?.supplier.name}</h2>

                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>




      </div>

    </div>
  )
}

export default InventorySnapshotTab
