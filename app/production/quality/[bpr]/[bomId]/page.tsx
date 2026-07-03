import React from 'react'
import { getBprBomItem } from './_functions/getBomItem';
import Title from './_components/Title';
import { getBpr } from '../_functions/getBpr';
import { getBprStaging } from './_functions/getBprStagings';
import ActionsArea from './_components/ActionsArea';
import QuantitiesPanel from './_components/QuantitiesPanel';
import StagedArea from './_components/StagedArea';
import HelperSetter from '@/components/Helper/HelperSetter';

type PageProps = {
  searchParams: {
    bprBomId: string;
    bprId: string;
  };
}

const BomVerificationPage = async ({ searchParams }: PageProps) => {

  const { bprBomId, bprId } = searchParams

  const bomItem = await getBprBomItem(bprBomId)
  const bpr = await getBpr(bprId)
  const stagings = await getBprStaging(bprBomId)

  
  if (!bomItem) return;


  return (
    <div className='flex flex-col gap-y-6'>
      <HelperSetter section="production-quality-verify" />
      <Title bpr={bpr as any} />

      <h1 className='font-black font-poppins text-3xl '>Verifying {bomItem.bom.item.name} ({bomItem.bom.identifier})</h1>
      
      <ActionsArea bomItem={bomItem as any} stagings={stagings as any}/>

      <QuantitiesPanel bomItem={bomItem as any} staged={stagings} />

      <StagedArea stagings={stagings as any } />



    </div>

  )
}

export default BomVerificationPage
