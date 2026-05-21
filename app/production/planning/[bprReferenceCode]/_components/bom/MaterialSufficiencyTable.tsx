'use client'
import MaterialSufficiencyLine from './MaterialSufficiencyLine'
import MaterialAllocationDialog from './MaterialAllocationDialog'
import { useBprDetailsSelection } from '@/store/bprDetailsSlice'
import { bprStatuses } from '@/configs/staticRecords/bprStatuses'

const MaterialSufficiencyTable = () => {

  const { bomInventory, bpr } = useBprDetailsSelection()
  const status = bpr?.status.id
  const isDraft = status === bprStatuses.draft

  return (
    <div>

      <MaterialAllocationDialog />
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Material Name</th>
              {isDraft ? <th>Required</th> : <th>Needed for Another Batch</th>}
              {isDraft ? <th>Available</th> : <th>Available for Another Batch</th>}
              <th>Soft Allocated</th>
              <th>Soft Availability</th>
              <th>Sufficiency</th>
              {!isDraft && <th>Staged</th>}
              {!isDraft && <th>1° Verification</th>}
              {!isDraft && <th>2° Verification</th>}

            </tr>
          </thead>

          <tbody>
            {bomInventory.map((material) => <MaterialSufficiencyLine key={material.id} material={material} isDraft={isDraft} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MaterialSufficiencyTable
