import React from 'react'
import { getAwaitingVerificationBprs } from './_function/getAwaitingVerificationBprs'
import BprCard from './_components/BprCard';
import PageTitle from '@/components/Text/PageTitle';
import Confetti from '@/components/Confetti/Confetti';
import { getStepsWithQuality } from './_function/getStepsWithQuality';
import CompoundingStepCard from './_components/CompoundingStepCard';
import HelperSetter from '@/components/Helper/HelperSetter';

const QualityPage = async () => {

  const bprs = await getAwaitingVerificationBprs();
  const secondaryBprs = await getAwaitingVerificationBprs(true);

  const hasVerifiables = bprs.length !== 0;
  const hasSecondaries = secondaryBprs.length !== 0;


  // for compounding
  const compoundingVerification = await getStepsWithQuality(false)
  const compoundingSecondaries = await getStepsWithQuality(true)
  const hasCompundingVerifiables = compoundingVerification.length !== 0;
  const hasCompoundingSecondaries = compoundingSecondaries.length !== 0;


  return (
    <div className='flex flex-col gap-y-4'>

      <HelperSetter section="production-quality" />

      {(!hasVerifiables && !hasSecondaries && !hasCompundingVerifiables) && <Confetti />}

      {(hasVerifiables || hasSecondaries || hasCompundingVerifiables) && (
        <div className='flex flex-col gap-y-4'>
          <PageTitle>Awaiting Primary Verification</PageTitle>

          {(!hasVerifiables && !hasCompundingVerifiables) && <div className='w-1/3 flex flex-col bg-base-200 rounded-lg p-4 gap-y-4 hover:cursor-pointer hover:bg-base-200/50 font-poppins text-lg font-medium'>You&apos;re all done here!</div>}

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {hasVerifiables && (
              bprs.map((bpr) => <BprCard key={bpr.id} bpr={bpr as any} isSecondary={false} />)
            )}

            {hasCompundingVerifiables && (
              compoundingVerification.map((step) => <CompoundingStepCard key={step.id} step={step as any} isSecondary={false} />)
            )}
          </div>



          <PageTitle>Awaiting Secondary Verification</PageTitle>
          {(!hasSecondaries && !hasCompoundingSecondaries) && <div className='w-1/3 flex flex-col bg-base-200 rounded-lg p-4 gap-y-4 hover:cursor-pointer hover:bg-base-200/50 font-poppins text-lg font-medium'>You&apos;re all done here!</div>}

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {hasSecondaries && (
              secondaryBprs.map((bpr) => <BprCard key={bpr.id} bpr={bpr as any} isSecondary={true} />)
            )}

            {hasCompoundingSecondaries && (compoundingSecondaries.map((step) => <CompoundingStepCard key={step.id} step={step as any} isSecondary={true} />))}

          </div>
        </div>
      )}
    </div>
  )
}

export default QualityPage;

