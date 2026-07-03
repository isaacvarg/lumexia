import React from 'react'
import { getRequests } from './_functions/getRequests'
import { getAllGeneralRequests } from './general/_actions/getAllGeneralRequests'
import Header from './_components/shared/Header'
import StateSetter from './_components/shared/StateSetter'
import TabSelector from './_components/shared/TabSelector'
import TabsContainer from './_components/shared/TabContainer'
import RequestHelper from './_components/shared/RequestHelper'

const RequestsPage = async () => {

  const requests = await getRequests()
  const generalRequests = await getAllGeneralRequests(false);


  return (
    <div className='flex flex-col gap-y-6'>

      <Header />

      <StateSetter
        requests={requests}
        generalRequests={generalRequests}
      />

      <RequestHelper />

      <TabSelector />
      <TabsContainer />



    </div>
  )
}

export default RequestsPage
