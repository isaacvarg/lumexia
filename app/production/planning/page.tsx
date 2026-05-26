import React from 'react'
import PageTitle from '@/components/Text/PageTitle';
import AddBprButton from './_components/createNewBpr/AddBprButton';
import { productionActions } from '@/actions/production';
import StateSetter from './_components/state/StateSetter';
import TabSelector from './_components/shared/TabSelector';
import TabsContainer from './_components/shared/TabsContainer';
import CompleteBprs from './_components/shared/CompleteBprs';

const PlanningPage = async () => {
  const bprs = await productionActions.planning.getBprs()
  const allBprs = await productionActions.planning.getAllBprs()
  const statuses = await productionActions.bprs.statuses.getAll()

  return (
    <div className='flex flex-col gap-y-4'>

      <StateSetter bprs={bprs} allBprs={allBprs} statuses={statuses} />

      <div className='flex justify-between items-center'>
        <PageTitle>Planning</PageTitle>
        <div className='flex gap-2'>
          <AddBprButton />
          <CompleteBprs />
        </div>
      </div>

      <TabSelector />

      <TabsContainer />



    </div>

  )
}

export default PlanningPage
