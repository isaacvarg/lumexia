'use client'
import React, { useState } from 'react'
import { IPurchasingRequest } from '../../_functions/getRequests'
import { useRouter } from 'next/navigation'
import Dropdown from '@/components/Dropdown'
import { Prisma } from '@prisma/client'
import DateBadge from './DateBadge'
import { updateRequest } from '../../_functions/updateRequest'
import { usePurchasingRequestSelection } from '@/store/purchasingRequestSlice'
import { DateTime } from 'luxon'
import { dateFormatString, dateFormatWithTime } from '@/configs/data/dateFormatString'
import { TbX } from 'react-icons/tb'

type RequestCardProps = {
  request: IPurchasingRequest
}

const RequestCard = ({ request }: RequestCardProps) => {

  const router = useRouter()
  const { options } = usePurchasingRequestSelection()
  const [isStatus, setIsStatus] = useState(false);
  const [isPriority, setIsPriority] = useState(false);


  const handleClick = () => {
    router.push(`/purchasing/requests/${request.referenceCode}?id=${request.id}`)
  }

  const handleChangeClick = async (value: string, mode: 'priority' | 'status') => {
    let payload: Prisma.PurchasingRequestUncheckedUpdateInput = {
      statusId: value
    };

    if (mode === 'priority') {
      payload = {
        priorityId: value
      }
    };

    await updateRequest(request.id, payload)
    setIsStatus(false);
    setIsPriority(false)
    router.refresh()
  }

  if (isStatus) {
    return (
      <div
        className='card bg-base-300/50 border-base-300/50 p-2 border-2 hover:cursor-pointer hover:bg-base-300/30 flex flex-col gap-2' >
        <div className='flex justify-end'><button className='btn btn-circle btn-sm btn-warning' onClick={() => setIsStatus(false)}><TbX className="size-2" /></button></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1'>
          {options.statuses.map(s => {
            return (
              <button
                key={s.id}
                onClick={() => handleChangeClick(s.id, 'status')}
                className='btn btn-sm btn-accent'>{s.name}</button>
            )
          })}
        </div>
      </div>
    )
  }

  if (isPriority) {
    return (
      <div
        className='card bg-base-300/50 border-base-300/50 p-2 border-2 hover:cursor-pointer hover:bg-base-300/30 flex flex-col gap-2' >
        <div className='flex justify-end'><button className='btn btn-circle btn-sm btn-warning' onClick={() => setIsPriority(false)}><TbX className="size-2" /></button></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1'>
          {options.priorities.map(s => {
            return (
              <button
                key={s.id}
                onClick={() => handleChangeClick(s.id, 'priority')}
                className='btn btn-sm btn-accent'>{s.name}</button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => handleClick()}
      className='card bg-base-300/50 border-base-300/50 border-2 hover:cursor-pointer hover:bg-base-300/30' >
      <div className='card-body flex flex-col gap-y-2'>
        <div className='flex flex-col'>
          <div className='text-xs text-base-content/65'>{DateTime.fromJSDate(request.createdAt).toFormat(dateFormatWithTime)}</div>
          <div className='card-title'>{`${request.item.name}`}</div>
        </div>

        <div className='flex flex-row flex-wrap gap-1 '>
          <div className='flex items-center justify-center px-2 py-2   bg-primary rounded-xl '>
            <p className='font-poppins w-8 text-center font-semibold text-sm text-primary-content'>{`${request.referenceCode}`}</p>
          </div>

          <button
            type='button'
            style={{ background: request.status.bgColor, color: request.status.textColor }}
            onClick={(e) => { e.stopPropagation(); setIsStatus(true) }}
            className='btn btn-md'>
            {request.status.name}
          </button>

          <button
            type='button'
            onClick={(e) => { e.stopPropagation(); setIsPriority(true) }}
            style={{ background: request.priority.bgColor, color: request.priority.textColor }}
            className='btn btn-md'>
            {request.priority.name}
          </button>


        </div>

        {/* <DateBadge request={request} />*/}

      </div>

    </div>
  )
}

export default RequestCard
