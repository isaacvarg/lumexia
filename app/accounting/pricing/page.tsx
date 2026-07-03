import React from 'react'
import Card from '@/components/Card'
import { getItems } from './_functions/getItems'
import BeginPricingExamDialog from './_components/BeginPricingExamDialog'
import BeginPricingExaminationButton from './_components/BeginPricingExaminationButton'
import { accountingActions } from '@/actions/accounting'
import LatestExaminationsTable from './_components/LatestExaminationsTable'
import QueueList from './_components/QueueList'
import TemplatesButton from './_components/TemplatesButton'
import AllExaminationsTable from './_components/AllExaminationsTable'
import { Tabs } from '@/components/Tabs2'
import HelperSetter from '@/components/Helper/HelperSetter'

const PricingPage = async () => {

  const items = await getItems();
  const examinations = await accountingActions.examinations.getAll()

  return (
    <div className='flex flex-col gap-y-6'>

      <HelperSetter section="accounting-pricing" />

      <BeginPricingExamDialog items={items} />

      <div className='flex justify-between items-center'>
        <div className='flex gap-x-4'>
          <BeginPricingExaminationButton />
        </div>

        <TemplatesButton />
      </div>

      <Tabs.Root defaultValue="overview">
        <Tabs.List>
          <Tabs.Trigger size="large" value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger size="large" value="all">All Examinations</Tabs.Trigger>
        </Tabs.List>

        <Tabs.ContentContainer>
          <Tabs.Content value="overview">
            <div className='grid grid-cols-2 gap-6'>
              <Card.Root>
                <Card.Title>Queue</Card.Title>
                <QueueList />
              </Card.Root>

              <Card.Root>
                <Card.Title>Latest</Card.Title>
                <LatestExaminationsTable examinations={examinations} />
              </Card.Root>
            </div>
          </Tabs.Content>

          <Tabs.Content value="all">
            <AllExaminationsTable examinations={examinations} />
          </Tabs.Content>
        </Tabs.ContentContainer>
      </Tabs.Root>

    </div >
  )
}

export default PricingPage
