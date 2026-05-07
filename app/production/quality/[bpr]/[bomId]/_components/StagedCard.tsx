"use client"

import ActionButton from '@/components/ActionButton';
import { ExBprStaging } from '@/types/bprStaging';
import React, { useState } from 'react';
import { verifyBomItemStaging } from '../_functions/verifyBomItemStaging';
import useProduction from '@/hooks/useProduction';
import { bprStagingStatuses } from '@/configs/staticRecords/bprStagingStatuses';

const StagedCard = ({ staging }: { staging: ExBprStaging }) => {

  const { primaryVerified, secondaryVerified } = bprStagingStatuses;
  const { isSecondaryVerificationMode } = useProduction()

  const completedStatus = isSecondaryVerificationMode ? secondaryVerified : primaryVerified;



  let bg;
  switch (staging.bprStagingStatusId) {
    case primaryVerified:
      bg = "bg-blue-200"
      break;
    case secondaryVerified:
      bg = "bg-emerald-200"
      break;
    default:
      bg = 'bg-zinc-100'
      break;
  }

  const handleVerify = async () => {
    await verifyBomItemStaging(staging, isSecondaryVerificationMode)
  }

  const handleNote = () => {

  }



  return (
    <div className={`p-8 ${bg} rounded-lg flex flex-col gap-y-4 font-poppins font-medium text-xl `}>
      <span className=''>{staging.quantity} lb</span>
      <h1>Lot: {staging.lot.lotNumber}</h1>
      <span>Staged By {staging.pulledByUser.name}</span>

      <div className='flex gap-x-4'>
        {staging.bprStagingStatusId !== completedStatus && <ActionButton onClick={() => handleVerify()}>Verify</ActionButton>}
        <ActionButton onClick={() => handleNote()} color='neutral'>Note</ActionButton>
      </div>
    </div>
  );
};

export default StagedCard;

