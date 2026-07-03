import PageTitle from '@/components/Text/PageTitle'
import React from 'react'
import CreateEditMBPR from './_components/CreateEditMBPR'
import { productionActions } from '@/actions/production'
import MbprTable from './_components/MbprTable'
import HelperSetter from '@/components/Helper/HelperSetter'

const MbprMainPage = async () => {

  const mbprs = await productionActions.mbprs.getAll()

  return (
    <div className='flex flex-col gap-6'>
      <HelperSetter section="mbpr" />

      <PageTitle>Master Batch Production Records</PageTitle>

      <div className='flex justify-start'>
        <CreateEditMBPR />
      </div>

      <MbprTable mbprs={mbprs} />



    </div>
  )
}

export default MbprMainPage
