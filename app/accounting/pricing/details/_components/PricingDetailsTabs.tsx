'use client'
import { SinglePricingExaminationCombined } from '@/actions/accounting/examinations/getOne'
import { Tabs } from '@/components/Tabs2'
import React from 'react'
import FinishedProductsPanel from './FinishedProductsPanel'
import ContainerParametersTable from './ContainerParametersTable'
import BomArchiveTable from './BomArchiveTable'
import BomPricingChart from '../../[item]/_components/BomPricingChart'
import { ProducedPricingExaminationForDashboard } from '../../[item]/_functions/getProducedPricingExamination'

type Props = {
  examination: SinglePricingExaminationCombined
  isProduced: boolean
  producedExaminations: ProducedPricingExaminationForDashboard[]
}

const PricingDetailsTabs = ({ examination, isProduced, producedExaminations }: Props) => {
  return (
    <Tabs.Root defaultValue='finishedProducts'>
      <Tabs.List>
        <Tabs.Trigger size='large' value='finishedProducts'>Finished Products</Tabs.Trigger>
        <Tabs.Trigger size='large' value='pricingParameters'>Pricing Parameters</Tabs.Trigger>
      </Tabs.List>

      <Tabs.ContentContainer>
        <Tabs.Content value='finishedProducts'>
          <FinishedProductsPanel finishedProducts={examination.FinishedProductArchive} />
        </Tabs.Content>

        <Tabs.Content value='pricingParameters'>
          <div className='flex flex-col gap-6'>
            {isProduced && (
              <>
                <BomPricingChart examinations={producedExaminations} />
                <BomArchiveTable rows={examination.BomPricingDataArchive} />
              </>
            )}
            <ContainerParametersTable finishedProducts={examination.FinishedProductArchive} />
          </div>
        </Tabs.Content>
      </Tabs.ContentContainer>
    </Tabs.Root>
  )
}

export default PricingDetailsTabs
