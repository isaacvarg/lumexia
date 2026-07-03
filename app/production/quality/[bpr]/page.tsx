import React from 'react'
import Title from './_components/Title';
import { getBpr } from './_functions/getBpr';
import { getBprBom } from './_functions/getBprBom';
import AwaitingVerificationPanel from './_components/AwaitingVerificationPanel';
import HelperSetter from '@/components/Helper/HelperSetter';

type BprQualityProps = {
    searchParams: {
        id: string;
    };
}

const BprQualityPage = async ({ searchParams }: BprQualityProps) => {

    const { id } = searchParams
    const bpr = await getBpr(id)

    // for staging
    const bom = await getBprBom(id, false)
    const bomNeedingSecondary = await getBprBom(id, true)

    return (
        <div className='flex flex-col gap-y-4'>
            <HelperSetter section="production-quality-verify" />
            <Title bpr={bpr as any} />


            <AwaitingVerificationPanel bomItems={bom as any} bomNeedingSecondary={bomNeedingSecondary as any} />



        </div>
    )
}

export default BprQualityPage
