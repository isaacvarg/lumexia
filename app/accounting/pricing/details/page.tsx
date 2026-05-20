import { accountingActions } from '@/actions/accounting'
import { getUserId } from '@/actions/users/getUserId'
import PageBreadcrumbs from '@/components/App/PageBreadcrumbs'
import PageTitle from '@/components/Text/PageTitle'
import React from 'react'
import BasicsPanel from './_components/BasicsPanel'
import ActionsPanel from './_components/ActionsPanel'
import FinishedProductsPanel from './_components/FinishedProductsPanel'
import NotesPanel from './_components/NotesPanel'
import ApproveButton from './_components/ApproveButton'
import RejectButton from './_components/RejectButton'

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


  return (
    <div className="flex flex-col gap-y-4">

      <div className="flex items-center justify-between">
        <PageTitle>{`${examination.examinedItem.name} Pricing Examination `}</PageTitle>
        <div className="flex gap-2">
          <RejectButton examId={examId} />
          <ApproveButton examId={examId} isSelf={isSelf} />
        </div>
      </div>


      <div className='grid grid-cols-2 gap-6'>
        <BasicsPanel exam={examination} />

        <NotesPanel pricingExaminationId={examId} notes={examination.PricingExaminationNote} noteTypes={noteTypes} />


        <FinishedProductsPanel finishedProducts={examination.FinishedProductArchive} />

      </div>





    </div>


  )
}

export default PricingDetailsPage 
