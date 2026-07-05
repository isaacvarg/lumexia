import { BprStatus } from '@/actions/production/getBprStatuses';
import { PlanningBpr } from '@/actions/production/getPlanningBprs';
import { Search } from '@/components/Search';
import React, { useState } from 'react'
import BprCard from './BprCard';
import { bprStatuses } from '@/configs/staticRecords/bprStatuses';

type Props = {
  bprs: PlanningBpr[],
  statuses: BprStatus[],
}
const ByStatusPanel = ({ statuses, bprs }: Props) => {

  const [searchResults, setSearchResults] = useState<PlanningBpr[]>(bprs)

  const statusCounts = statuses.map((status) => ({
    ...status,
    count: bprs.filter((bpr) => bpr.status.name === status.name).length
  }));
  return (

    <div className='flex flex-col gap-y-6'>

      <Search.Searcher
        data={bprs}
        keys={['producedItemName', 'referenceCode']}
        onQueryComplete={setSearchResults}
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {statusCounts.filter((s) => s.count !== 0).map((status) => {

          if (status.id === bprStatuses.failed) {
            return;
          }

          let bprsForStatus = searchResults.filter((req) => req.status.id === status.id);


          return (
            <div
              key={status.id}
              style={{ backgroundColor: status.bgColor }}
              className={`p-6 rounded-lg shadow-xl ${status.id === bprStatuses.released ? 'col-span-1 sm:col-span-2' : ''}`}
            >
              <div className='flex flex-col gap-y-6'>
                <div
                  style={{ color: status.textColor }}
                  className='font-poppins text-xl font-semibold'>
                  {status.name}
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto gap-6'>
                  {bprsForStatus.map((bpr) => <BprCard key={bpr.id} statuses={statuses} bpr={bpr} />)}
                </div>
              </div>

            </div>
          )
        })}

      </div>





    </div>
  )
}

export default ByStatusPanel
