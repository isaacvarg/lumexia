import React, { Dispatch, SetStateAction, } from 'react'
import Text from '@/components/Text'
import Tag from '@/components/Text/Tag'
import Dialog from '@/components/Dialog'
import { getSlug } from '@/utils/general/getSlug'
import { useRouter } from 'next/navigation'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import { TbPlus } from 'react-icons/tb'
import { DateTime } from 'luxon'
import { BprBomItemInventory } from '@/actions/inventory/inventory/getAllByBom'
import { PurchasingRequestForPlanning } from '@/actions/purchasing/requests/getByItem'

const MaterialAllocationPanels = ({
  material,
  requests,
  isLoading,
  setMode

}: {
  material: BprBomItemInventory
  requests: PurchasingRequestForPlanning[]
  isLoading: boolean
  setMode: Dispatch<SetStateAction<"default" | "request" | "audit">>
}) => {

  const router = useRouter()

  const availableAfterBatch = material.totalQuantityAvailable - material.quantity;
  const softAvailabilityAfterBatch = material.totalQuantitySoftAvailability - material.quantity;

  const handleProductClick = () => {
    const formattedName = getSlug(material.bom.item.name);
    const path = `/inventory/items/${`${formattedName}?id=${material.bom.item.id}`} `
    router.push(path)
  }

  const handleNewRequest = () => {
    setMode('request')
  }

  const handleRequestClick = (request: PurchasingRequestForPlanning) => {
    router.push(`/purchasing/requests/${request.referenceCode}?id=${request.id}`)
  }

  return (
    <div>
      <Dialog.Title>
        Material Allocations for <span onClick={() => handleProductClick()} className="underline decoration-wavy hover:cursor-pointer hover:text-sky-900 ">{material.bom.item.name}</span>
      </Dialog.Title>

      <div className="flex flex-col gap-y-6 overflow-auto" >
        <div className='flex gap-x-2'>
          <button className='btn btn-accent' onClick={() => setMode('audit')}>Request Inventory Audit</button>
        </div>

        <div className="flex flex-col gap-y-4">
          <Text.SectionTitle size="small">General</Text.SectionTitle>
          <Text.LabelDataPair label="On Hand" tooltip="Physical quantity currently in stock across all lots of this item." data={`${toFracitonalDigits.weight(material.totalQuantityOnHand)} lbs`} />
          <Text.LabelDataPair label="Allocated (Other Batches)" tooltip="Quantity committed to other confirmed BPRs (queued, staging, compounding, awaiting materials, or completed) that have not yet consumed their materials. Excludes this BPR." data={`${toFracitonalDigits.weight(material.totalQuantityAllocated)} lbs`} />
          <Text.LabelDataPair label="Soft Allocated (Other Batches)" tooltip="Quantity committed to other draft BPRs that have not yet been confirmed. These will become Allocated once the BPR is confirmed. Excludes this BPR." data={`${toFracitonalDigits.weight(material.totalQuantitySoftAllocated)} lbs`} />
          <Text.LabelDataPair label="Required for this Batch" tooltip="Amount of this material required to complete this BPR's batch." data={`${toFracitonalDigits.weight(material.quantity)} lbs`} />
          <Text.LabelDataPair label="Available after this Batch" tooltip="On Hand minus Allocated (other batches) minus this batch's requirement. The quantity that would remain free once this batch is allocated." data={`${toFracitonalDigits.weight(availableAfterBatch)} lbs`} />
          <Text.LabelDataPair label="Soft Availability after this Batch" tooltip="Available after this batch minus Soft Allocated (other batches). The quantity that would remain free if this batch and every current draft BPR were confirmed." data={`${toFracitonalDigits.weight(softAvailabilityAfterBatch)} lbs`} />
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex justify-between">
            <Text.SectionTitle size="small">Active Purchasing Requests</Text.SectionTitle>
          </div>

          {isLoading ? <div className="skeleton h-32 w-32"></div> : null}

          {requests.length > 0 ? (<div className='grid grid-cols-3 gap-4'>
            <div className="card bg-base-300 hover:cursor-pointer hover:bg-lilac-200 " onClick={() => handleNewRequest()}>
              <div className="card-body flex flex-col justify-center items-center">
                <div className='card-title'><div className='flex gap-x-2'><span className='text-2xl'><TbPlus /></span>New Purchase Request</div></div>
              </div>
            </div>
            {requests.map((request) => {

              const quantityOnOrderByUom = request.pos.reduce((totals, { po }) => {
                po.purchaseOrderItems
                  .filter((poItem) => poItem.itemId === request.itemId)
                  .forEach((poItem) => {
                    const uom = poItem.uom.abbreviation
                    totals[uom] = (totals[uom] ?? 0) + poItem.quantity
                  })
                return totals
              }, {} as Record<string, number>)

              const onOrderLabel = Object.entries(quantityOnOrderByUom)
                .map(([uom, quantity]) => `${toFracitonalDigits.weight(quantity)} ${uom}`)
                .join(', ')

              return (
                <div key={request.id} className="bg-base-300/70 hover:cursor-pointer p-4 rounded-xl hover:bg-base-300/50 " onClick={() => handleRequestClick(request)}>
                  <div className="flex flex-col gap-2 items-start">
                    <div className='font-poppins text-lg font-semibold'>{request.title}</div>
                    <Tag
                      label={request.status.name}
                      bgColor={request.status.bgColor}
                      textColor={request.status.textColor}
                    />
                    <div className='font-inter text-base font-medium'>{onOrderLabel ? `${onOrderLabel} on order` : 'Nothing on order'}</div>
                  </div>
                </div>
              )
            })}
          </div>) : (<div className='grid grid-cols-3 gap-4'>
            <div className="card bg-base-300 hover:cursor-pointer hover:bg-lilac-200 " onClick={() => handleNewRequest()}>
              <div className="card-body">
                <div className='card-title'><div className='flex gap-x-2'><span className='text-2xl'><TbPlus /></span>New Purchase Request</div></div>
              </div>
            </div>
          </div>
          )}
        </div>


        <Text.SectionTitle size="small">Allocations</Text.SectionTitle>
        <div className="overflow-x-auto">
          <div className='h-40 overflow-auto'>
            <table className="table">

              <thead>
                <tr>
                  <th>BPR #</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Allocated</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {material.allocated.map((bprBom) => {
                  return (
                    <tr key={bprBom.id}>
                      <th>{bprBom.bpr.referenceCode}</th>
                      <td>{bprBom.bpr.mbpr.producesItem.name}</td>
                      <td>{bprBom.bpr.status.name}</td>
                      <td>{toFracitonalDigits.weight(bprBom.quantity)} lbs</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-x-auto">

          <Text.SectionTitle size="small">Purchases</Text.SectionTitle>
          <div className='h-40 overflow-auto'>
            <table className="table">

              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Quantity Ordered</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {material.purchases.map((po) => {
                  return (
                    <tr key={po.id}>
                      <th>{po.purchaseOrders.referenceCode}</th>
                      <td>{po.quantity}</td>
                      <td>{po.purchaseOrders.status.name}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>


    </div>
  )
}

export default MaterialAllocationPanels
