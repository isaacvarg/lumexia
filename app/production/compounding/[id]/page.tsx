import React from 'react'
import { getBpr } from './_functions/getBpr';
import Title from './_components/Title';
import { getBom } from './_functions/getBom';
import StagingPanel from './_components/staging/StagingPanel';
import CompoundingPanel from './_components/compounding/CompoundingPanel';
import QueuedPanel from './_components/queued/QueuedPanel';
import { bprStatuses } from '@/configs/staticRecords/bprStatuses';
import HelperSetter from '@/components/Helper/HelperSetter';

type CompoundingPageProps = {
  searchParams: {
    id: string;
  };
};


const CompoundingPage = async ({ searchParams }: CompoundingPageProps) => {
  const bpr = await getBpr(searchParams.id)
  const bom = await getBom(bpr?.id)

  const isStaging = bpr?.bprStatusId === bprStatuses.stagingMaterials;
  const isCompoudning = bpr?.bprStatusId === bprStatuses.compounding;
  const isQueued = bpr?.bprStatusId === bprStatuses.queued;



  return (
    <div className='flex flex-col gap-y-4'>
      <HelperSetter section="compounding-batch" />
      <Title bpr={bpr as any} />

      {isStaging && <StagingPanel bom={bom as any} />}

      {isCompoudning && <CompoundingPanel bpr={bpr as any} />}

      {isQueued && <QueuedPanel bpr={bpr as any} />}

    </div>
  )
}

export default CompoundingPage
