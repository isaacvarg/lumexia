import { productionActions } from '@/actions/production';
import PageTitle from '@/components/Text/PageTitle';
import React from 'react'
import { appActions } from '@/actions/app';
import Link from 'next/link';
import StateSetter from './_components/state/StateSetter';
import TabSelector from './_components/shared/TabSelector';
import TabsContainer from './_components/shared/TabsContainer';
import MbprHelper from './_components/shared/MbprHelper';

type MbprDetailsProps = {
  searchParams: {
    id: string;
  };
};


const MbprDetailsPage = async ({ searchParams }: MbprDetailsProps) => {

  const [mbpr, recordStatuses] = await Promise.all([
    productionActions.mbprs.getOne(searchParams.id),
    appActions.recordStatuses.getAll(),
  ])

  const [notes, activity] = await Promise.all([
    productionActions.mbprs.notes.getAllByMbpr(mbpr.id),
    productionActions.mbprs.activity.getAll(mbpr.id),
  ])

  return (
    <div className='flex flex-col gap-y-6'>
      <div className='flex justify-between items-center'>
        <PageTitle>{mbpr.producesItem.name} MBPR</PageTitle>
        <Link href={`/production/mbpr/wizard?itemId=${mbpr.producesItemId}`} className='btn btn-accent'>
          Edit MBPR
        </Link>
      </div>

      <StateSetter
        mbpr={mbpr}
        notes={notes}
        activity={activity}
        statuses={recordStatuses}
      />

      <MbprHelper />

      <TabSelector />
      <TabsContainer />
    </div>
  )
}

export default MbprDetailsPage
