'use client'
import Text from '@/components/Text'
import { DateTime } from 'luxon'
import React, { useEffect, useMemo, useState } from 'react'
import { updateRequest } from '../_functions/updateRequest'
import { RequestStatus } from '../_functions/getRequestStatuses'
import { RequestPriority } from '../../_functions/getPriorities'
import Card from '@/components/Card'
import SectionTitle from '@/components/Text/SectionTitle'
import { TbDeviceFloppy, TbPlus, TbX } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import { SupplierTag } from '../_functions/getSupplierTags'
import SearcherUnmanaged from '@/components/Search/SearcherUnmanaged'
import { RequestSupplier } from '../_functions/getSuppliers'
import { createSupplierTag } from '../_functions/createSupplierTag'
import { deleteSupplierTag } from '../_functions/deleteSupplierTag'
import { getDisplayDate } from '@/utils/dateTime/getDisplayDate'
import { DateRange, DayPicker } from 'react-day-picker'
import { createActivityLog } from '@/utils/auxiliary/createActivityLog'

import "react-day-picker/style.css";

type BasicDetailsPanelProps = {
  requestingUser: string
  statusId: string;
  statusName: string
  priorityName: string,
  expectedDateStart: Date | null
  expectedDateEnd: Date | null
  requestDate: Date
  requestId: string
  allStatuses: RequestStatus[]
  allPriorities: RequestPriority[]
  priorityId: string;
  supplierTags: SupplierTag[]
  suppliers: RequestSupplier[]
}


const BasicDetailsPanel = ({ suppliers, supplierTags, requestingUser, priorityId, requestDate, requestId, allStatuses, allPriorities, statusId, expectedDateStart, expectedDateEnd }: BasicDetailsPanelProps) => {

  const [isEditStatus, setIsEditStatus] = useState(false);
  const router = useRouter()
  const [isEditPriority, setIsEditPriority] = useState(false);
  const [isAddTag, setIsAddTag] = useState(false);
  const currentStatus = useMemo(() => {
    return allStatuses.find(s => s.id === statusId);
  }, [statusId]);
  const currentPriority = useMemo(() => {
    return allPriorities.find(p => p.id === priorityId);
  }, [priorityId]);
  const [tagInput, setTagInput] = useState('');
  const [tagResults, setTagResults] = useState<RequestSupplier[]>([]);
  const [isEditDate, setIsEditDate] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange>()

  const handleTagDelete = async (id: string) => {
    await deleteSupplierTag(id);

    await createActivityLog('Remove Supplier Tag', 'requestId', requestId, { context: `Removed supplier tag` })
    router.refresh()
  }

  const handleDateDelete = async () => {
    await updateRequest(requestId, {
      expectedDateStart: null,
      expectedDateEnd: null,
    });
    await createActivityLog('Remove Expected Date', 'requestId', requestId, { context: 'Expected date was removed' })
    setIsEditDate(false)
    router.refresh()

  }


  const handleDateSave = async () => {
    await updateRequest(requestId, {
      expectedDateStart: selectedRange?.from,
      expectedDateEnd: selectedRange?.to
    });
    await createActivityLog('Modify Expected Date', 'requestId', requestId, { context: `Expected date changed to ${getDisplayDate((expectedDateStart && expectedDateEnd) ? { to: expectedDateStart, from: expectedDateEnd } : undefined)}` })
    setIsEditDate(false)
    router.refresh()

  }

  const handlePriorityOption = async (value: string) => {
    await updateRequest(requestId, { priorityId: value })
    await createActivityLog('Modify Priority', 'requestId', requestId, { context: `Changed Priority` })
    setIsEditPriority(false)
    router.refresh()
  };

  const handleStatusOptions = async (value: string) => {
    await updateRequest(requestId, { statusId: value })
    await createActivityLog('Modified Status', 'requestId', requestId, { context: `Changed status` })
    setIsEditStatus(false)
    router.refresh()
  }

  const handleTagAdd = async (supplierId: string) => {
    await createSupplierTag({
      purchasingRequestId: requestId,
      supplierId,
    });

    await createActivityLog('Add Supplier Tag', 'requestId', requestId, { context: `Supplier tag added` })
    setIsAddTag(false);
    setTagInput("");
    router.refresh()
  }


  return (
    <div className='flex flex-col gap-2'>
      <SectionTitle>Basics</SectionTitle>
      <Card.Root>

        {!isEditPriority && !isEditStatus && !isAddTag && !isEditDate && (<div className='flex flex-col gap-2'>
          <Text.LabelDataPair label='Requesting User' data={requestingUser} />
          <Text.LabelDataPair label='Request On' data={DateTime.fromJSDate(requestDate).toFormat('dd MMM yyyy \'at\' hh:mm a')} />

          <Text.LabelDataPair label='Expected On'>
            <button onClick={() => setIsEditDate(true)} className={`btn btn-md btn-primary`}>{getDisplayDate((expectedDateStart && expectedDateEnd) ? { to: expectedDateStart, from: expectedDateEnd } : undefined)}</button>
          </Text.LabelDataPair>


          <Text.LabelDataPair label='Status'>
            <button onClick={() => setIsEditStatus(true)} className={`btn btn-md btn-accent`}>{currentStatus?.name}</button>
          </Text.LabelDataPair>

          <Text.LabelDataPair label='Priority'>
            <button onClick={() => setIsEditPriority(true)} className={`btn btn-md btn-secondary`}>{currentPriority?.name}</button>
          </Text.LabelDataPair>

          <div className='flex flex-col gap-1 border-dotted border-b-base-content/60 rounded-tr-xl rounded-tl-xl py-1 px-2'>
            <div className='flex justify-between'>
              <label className={`font-inter font-medium text-lg text-base-content hover:cursor-pointer`}>
                Supplier Tags
              </label>
              <button onClick={() => setIsAddTag(true)} className='btn btn-secondary btn-circle btn-md'>
                <TbPlus className='size-5' />
              </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>

              {supplierTags.map(s => {
                return (
                  <button className='btn btn-accent' key={s.id} onClick={() => handleTagDelete(s.id)}>
                    {s.supplier.name}
                  </button>
                )
              })}
            </div>

          </div>


        </div>)}

        {isEditDate && (
          <div className='w-full h-full flex flex-col gap-4'>
            <div className='flex justify-between'>
              <button className='btn btn-outline btn-warning' onClick={() => handleDateDelete()}>Clear Date</button>
              <div className='flex gap-2'>
                <button className='btn btn-outline btn-error' onClick={() => setIsEditDate(false)}><TbX className='size-5' /> </button>
                <button onClick={handleDateSave} className='btn btn-success'><TbDeviceFloppy className='size-5' /> </button>
              </div>
            </div>

            <div className='flex justify-center w-full h-full'>
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={(range) => setSelectedRange(range)}
                classNames={{
                  chevron: `fill-base-content`, // Change the color of the chevron
                  today: `border-1 border-dashed border-base-content`, // Add a border to today's date
                  range_end: 'bg-secondar/50 rounded-full text-secondary-content',
                  range_middle: 'bg-secondary/40 text-secondary-content rounded-xl',
                  range_start: 'bg-secondar/50 rounded-full text-secondary-content',
                  selected: `bg-secondary text-secondary-content`, // Highlight the selected day
                }}
              />
            </div>
          </div>
        )}




        {isEditStatus && (
          <div className='flex flex-col gap-4'>
            <div className='flex justify-end'>
              <button className='btn btn-outline btn-error' onClick={() => setIsEditStatus(false)}><TbX className='size-5' /> </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {allStatuses.map(s => {
                return (
                  <button key={s.id} className='btn btn-h-20' onClick={() => handleStatusOptions(s.id)}>
                    {s.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {isEditPriority && (
          <div className='flex flex-col gap-4'>
            <div className='flex justify-end'>
              <button className='btn btn-outline btn-error' onClick={() => setIsEditPriority(false)}><TbX className='size-5' /> </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {allPriorities.map(p => {
                return (
                  <button key={p.id} className='btn btn-h-20' onClick={() => handlePriorityOption(p.id)}>
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {isAddTag && (
          <div className='flex flex-col gap-4 max-h-[400px]'>
            <SearcherUnmanaged
              data={suppliers}
              keys={['name']}
              input={tagInput}
              setInput={setTagInput}
              onQueryComplete={setTagResults}
            />

            <div className='grid grid-cols-1 gap-1 overflow-auto'>
              {tagResults.map(t => {
                return (
                  <button
                    key={t.id}
                    className='btn btn-accent btn-soft'
                    onClick={() => handleTagAdd(t.id)}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </Card.Root>
    </div>
  )
}

export default BasicDetailsPanel
