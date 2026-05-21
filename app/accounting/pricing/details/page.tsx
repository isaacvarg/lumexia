import { accountingActions } from '@/actions/accounting'
import { getUserId } from '@/actions/users/getUserId'
import PageBreadcrumbs from '@/components/App/PageBreadcrumbs'
import PageTitle from '@/components/Text/PageTitle'
import React from 'react'
import BasicsPanel from './_components/BasicsPanel'
import ActionsPanel from './_components/ActionsPanel'
import NotesPanel from './_components/NotesPanel'
import ApproveButton from './_components/ApproveButton'
import RejectButton from './_components/RejectButton'
import PricingDetailsTabs from './_components/PricingDetailsTabs'
import { procurementTypes } from '@/configs/staticRecords/procurementTypes'
import { getProducedPricingByItem } from '../[item]/_functions/getProducedPricingExamination'

interface PricingDetailsProps {
  searchParams: {
    id: string
  }
}

const PricingDetailsPage = async ({ searchParams }: PricingDetailsProps) => {

  const examId = searchParams.id
  const examination = await accountingActions.examinations.getOne(examId);
  const noteTypes = await accountingActions.examinations.notes.getAllNoteTypes();
  const currentUserId = await getUserId();
  const isSelf = examination.userId === currentUserId;
  const isPendingReview = examination.status?.name === 'Pending Review';
  const isProduced = examination.examinedItem.procurementTypeId === procurementTypes.produced;
  const producedExaminations = isProduced
    ? await getProducedPricingByItem(examination.examinedItemId)
    : [];


  return (
    <div className="flex flex-col gap-y-4">

      <div className="flex items-center justify-between">
        <PageTitle>{`${examination.examinedItem.name} Pricing Examination `}</PageTitle>
        {isPendingReview && (
          <div className="flex gap-2">
            <RejectButton examId={examId} />
            <ApproveButton examId={examId} isSelf={isSelf} />
          </div>
        )}
      </div>


      <div className='grid grid-cols-2 gap-6'>
        <BasicsPanel exam={examination} />

        <NotesPanel pricingExaminationId={examId} notes={examination.PricingExaminationNote} noteTypes={noteTypes} />
      </div>

      <PricingDetailsTabs
        examination={examination}
        isProduced={isProduced}
        producedExaminations={producedExaminations}
      />





    </div>


  )
}

export default PricingDetailsPage 
