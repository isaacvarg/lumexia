import PageBreadcrumbs from '@/components/App/PageBreadcrumbs'
import React from 'react'
import StepTrack from './_components/StepTrack'
import Card from '@/components/Card'
import ItemStep from './_components/step1/ItemStep'
import { getProducibles } from './_functions/getProducibles'
import InitialStateSetter from './_components/InitialStateSetter'
import VersionStep from './_components/step2/VersionStep'
import Title from './_components/Title'
import StepNavigator from './_components/step3/ProductionStep'
import stepAddendumTypeActions from '@/actions/production/stepAddendumTypes'
import stepActionableTypeActions from '@/actions/production/stepActionableTypes'
import BatchSizeStep from './_components/step4/BatchSizeStep'
import { productionActions } from '@/actions/production'
import HelperSetter from '@/components/Helper/HelperSetter'

type MbprWizardProps = {
  searchParams: {
    itemId?: string
  }
}

const MbprWizard = async ({ searchParams }: MbprWizardProps) => {

  const producibles = await getProducibles();
  const providedItemId = searchParams.itemId;
  const addendumTypes = await stepAddendumTypeActions.getAll();
  const actionableTypes = await stepActionableTypeActions.getAll();
  const compoundingVessels = await productionActions.compoundingVessels.getAll();

  return (
    <div className='flex flex-col gap-y-6'>
      <InitialStateSetter providedItemId={providedItemId} addendumTypes={addendumTypes} actionableTypes={actionableTypes} compoundingVessels={compoundingVessels} />
      <HelperSetter section="mbpr-edit" />
      <Title />

      <Card.Root >
        <div className='min-h-[800px] flex flex-col gap-y-8'>
          <StepTrack />

          <ItemStep producibles={producibles} />
          <VersionStep />
          <StepNavigator />
          <BatchSizeStep />

        </div>
      </Card.Root>



    </div>
  )
}

export default MbprWizard
