import { BprStatus } from '@/actions/production/getBprStatuses'
import { PlanningBpr } from '@/actions/production/getPlanningBprs'
import Dropdown from '@/components/Dropdown'
import { overrideBprStatus } from '@/lib/bpr/overrideBprStatus'
import { useRouter } from 'next/navigation'
import React from 'react'

const BprCard = ({ bpr, statuses }: { bpr: PlanningBpr, statuses: BprStatus[] }) => {

  const router = useRouter()
  const statusOptions = statuses.map((status) => ({
    label: status.name,
    value: status.id,
    ...status,
  }));



  const handleClick = () => {
    router.push(`/production/planning/${bpr.referenceCode}?id=${bpr.id}`)
  }

  const handleStatusDropdown = async (value: string) => {
    await overrideBprStatus(bpr.id, value);
    location.reload()
  }

  return (
    <div
      onClick={() => handleClick()}
      className='card bg-white bg-opacity-70 border-neutral-800/50 border-2 hover:cursor-pointer hover:bg-lilac-300' >
      <div className='card-body flex flex-col gap-y-2'>
        <div className='card-title'>{`${bpr.mbpr.producesItem.name}`}</div>

        <div className='font-poppins text-xl text-neutral-600 font-semibold'>{`${bpr.lotOrigin && bpr.lotOrigin.lot.lotNumber}`}</div>

        <div className='flex flex-row flex-wrap gap-1 '>
          <div className='flex items-center justify-center px-2 py-2   bg-neutral-300 rounded-xl '>
            <p className='font-poppins w-8 text-center font-semibold text-sm text-base-content'>{`${bpr.referenceCode}`}</p>
          </div>


          <Dropdown.Badge
            onClick={(value) => handleStatusDropdown(value)}
            bgColor={bpr.status.bgColor}
            textColor={bpr.status.textColor}
            label={bpr.status.name}
            options={statusOptions}
          />

        </div>

      </div>

    </div>

  )
}

export default BprCard
