"use client"
import Text from '@/components/Text'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import React from 'react'
import { ItemInventory } from '../_functions/getInventory'
import { OtherRequest } from '../_functions/getOtherRequests'
import { useRouter } from 'next/navigation'
import useDialog from '@/hooks/useDialog'
import RequestInventoryAuditDialog from './RequestInventoryAuditDialog'
import { LastAuditRequest } from '../_functions/getAuditRequests'
import { DateTime } from 'luxon'
import { dateFormatString } from '@/configs/data/dateFormatString'
import { auditRequestStatuses } from '@/configs/staticRecords/auditRequestStatuses'

const InventoryCurrentTab = ({ inventory, otherRequests, lastAuditRequests }: { inventory: ItemInventory, otherRequests: OtherRequest[], lastAuditRequests: LastAuditRequest[] }) => {


  const router = useRouter();
  const { showDialog } = useDialog()
  const hasPendingAuditRequest = lastAuditRequests.filter((audit) => audit.statusId === auditRequestStatuses.open).length !== 0;
  const lastAuditRequestCompleted = lastAuditRequests.filter((audit) => audit.statusId === auditRequestStatuses.completed);
  const lastInventoryAuditDate = (lastAuditRequestCompleted.length !== 0 && lastAuditRequestCompleted[0].inventoryAudit) ? DateTime.fromJSDate(lastAuditRequestCompleted[0].inventoryAudit.createdAt).toFormat(dateFormatString) : 'None';


  const handleAllocatedClick = (bpr: typeof inventory.allocated[number]) => {
    router.push(`/production/planning/${bpr.bpr.referenceCode}?id=${bpr.bprId}`)
  }

  const handlePoClick = (po: typeof inventory.purchases[number]) => {
    router.push(`/purchasing/purchase-orders/${po.purchaseOrders.referenceCode}?id=${po.purchaseOrderId}`)
  }


  return (
    <div>
      <RequestInventoryAuditDialog itemId={inventory.id || ''} />
      <div className="grid grid-cols-2 gap-4" >


        <div className='card bg-base-300'>
          <div className=" card-body flex flex-col gap-y-4">
            <div className='flex justify-between items-center'>
              <div className='card-title'>Current Inventory</div>
              <button className='btn btn-neutral' onClick={() => showDialog('requestnewinventoryaudit')}>Request Inventory Audit</button>
            </div>
            <Text.SectionTitle size="small">General</Text.SectionTitle>
            <Text.LabelDataPair label="Has Pending Audit" data={hasPendingAuditRequest ? 'Yes' : 'No'} />
            <Text.LabelDataPair label="Last Completed Audit" data={lastInventoryAuditDate} />
            <Text.LabelDataPair label="On Hand" tooltip="Physical quantity currently in stock across all lots of this item." data={`${toFracitonalDigits.weight(inventory.totalQuantityOnHand)} lbs`} />
            <Text.LabelDataPair label="Allocated" tooltip="Quantity committed to confirmed BPRs (queued, staging, compounding, awaiting materials, or completed) that have not yet consumed their materials." data={`${toFracitonalDigits.weight(inventory.totalQuantityAllocated)} lbs`} />
            <Text.LabelDataPair label="Soft Allocated" tooltip="Quantity committed to draft BPRs that have not yet been confirmed. These will become Allocated once the BPR is confirmed." data={`${toFracitonalDigits.weight(inventory.totalQuantitySoftAllocated)} lbs`} />
            <Text.LabelDataPair label="Available" tooltip="On Hand minus Allocated. The quantity free to be allocated right now." data={`${toFracitonalDigits.weight(inventory.totalQuantityAvailable)} lbs`} />
            <Text.LabelDataPair label="Soft Availability" tooltip="Available minus Soft Allocated. The quantity that would remain free if every current draft BPR were confirmed." data={`${toFracitonalDigits.weight(inventory.totalQuantitySoftAvailability)} lbs`} />
          </div>

        </div>



        <div className='card bg-base-300'>
          <div className=" card-body flex flex-col gap-y-4">
            <div className='card-title'>Pending BPRs</div>


            <div className="overflow-x-auto">
              <table className="table">

                <thead>
                  <tr>
                    <th>BPR #</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Needed</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.needed.map((bprBom) => {
                    return (
                      <tr key={bprBom.id} onClick={() => handleAllocatedClick(bprBom)} className='hover:bg-lilac-300 hover:cursor-pointer'>
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
        </div>

        <div className='card bg-base-300'>

          <div className=" card-body flex flex-col gap-y-4">
            <div className='card-title'>Purchases</div>


            <div className="overflow-x-auto">
              <table className="table">

                <thead>
                  <tr>
                    <th>PO #</th>
                    <th>Quantity Ordered</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.purchases.map((po) => {
                    return (
                      <tr key={po.id} onClick={() => handlePoClick(po)} className='hover:bg-lilac-300 hover:cursor-pointer'>
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



        <div className='card bg-base-300'>

          <div className=" card-body flex flex-col gap-y-4">
            <div className='card-title'>Allocations</div>

            <div className="overflow-x-auto">
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
                  {inventory.allocated.map((bprBom) => {
                    return (
                      <tr key={bprBom.id} onClick={() => handleAllocatedClick(bprBom)} className='hover:bg-lilac-300 hover:cursor-pointer'>
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
        </div>


      </div >


    </div >)

}

export default InventoryCurrentTab
