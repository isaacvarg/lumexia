import SectionTitle from "@/components/Text/SectionTitle"
import { usePurchasingRequestSelection } from "@/store/purchasingRequestSlice"
import Card from "@/components/Card"
import GeneralRequestCard from "./GeneralRequestCard"
import RequestCard from "../shared/RequestCard"
import { requestStatuses } from "@/configs/staticRecords/requestStatuses"

const NewTab = () => {

  const { requests, generalRequests } = usePurchasingRequestSelection()
  const newRequests = requests.filter(r => r.statusId === requestStatuses.requested);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      <div className="flex flex-col gap-4">

        <SectionTitle>In System</SectionTitle>

        <Card.Root>
          {newRequests.length === 0 ? (
            <div className='flex items-center justify-center py-10 text-base-content/60 text-sm'>
              No new in-system requests
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-auto'>
              {newRequests.map((request) => <RequestCard key={request.id} request={request} />)}
            </div>
          )}
        </Card.Root>


      </div>

      <div className="flex flex-col gap-4">

        <SectionTitle>General</SectionTitle>

        <Card.Root>
          {generalRequests.length === 0 ? (
            <div className='flex items-center justify-center py-10 text-base-content/60 text-sm'>
              No general requests
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-auto'>
              {generalRequests.map((request) => <GeneralRequestCard key={request.id} request={request} />)}
            </div>
          )}
        </Card.Root>


      </div>


    </div>
  )
}

export default NewTab
