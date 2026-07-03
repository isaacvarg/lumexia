import React from 'react'
import { getBprStaging } from './_functions/getBprStaging';
import { getBpr } from '../_functions/getBpr';
import Title from '../_components/Title';
import { getBprBomItem } from './_functions/getBprBomItem';
import QuantitiesPanel from './_component/QuantitiesPanel';
import ModeView from './_component/ModeView';
import HelperSetter from '@/components/Helper/HelperSetter';

type BomItemPageProps = {
  searchParams: {
    bprBomId: string;
    bprId: string;
  };
};

const BomItemPage = async ({ searchParams }: BomItemPageProps) => {
  const { bprBomId, bprId } = searchParams
  const stagings = await getBprStaging(bprBomId)
  const bpr = await getBpr(bprId)
  const bomItem = await getBprBomItem(bprBomId)
  

  if (!bomItem) return;

  return (
    <div className='flex flex-col gap-y-6'>
      <HelperSetter section="compounding-staging" />
      <Title bpr={bpr as any} />

      <h1 className='font-black font-poppins text-3xl '>Staging {bomItem.bom.item.name} ({bomItem.bom.identifier})</h1>
      
      <QuantitiesPanel bomItem={bomItem as any} staged={stagings} />

      <ModeView  bomItem={bomItem} stagings={stagings}/>
    </div>
  )
}

export default BomItemPage
