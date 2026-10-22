import UserIcon from "@/components/UI/UserIcon"
import { GeneralRequestMinimal } from "../../general/_actions/getAllGeneralRequests"
import { useRouter } from "next/navigation"
import { DateTime } from "luxon"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"

const GeneralRequestCard = ({ request }: { request: GeneralRequestMinimal }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/purchasing/requests/general/${request.id}?id=${request.id}`)
  }
  return (
    <div
      onClick={() => handleClick()}
      className='card bg-base-300/50 border-base-300/50 border-2 hover:cursor-pointer hover:bg-base-300/30' >
      <div className='card-body flex flex-col gap-y-2'>

        <div className="flex flex-col">
          <div className='text-xs text-base-content/65'>{DateTime.fromJSDate(request.createdAt).toFormat(dateFormatWithTime)}</div>
          <div className='card-title'>{`${request.title}`}</div>
        </div>

        <div className='flex flex-row gap-2  items-center'>
          <UserIcon kind={request.user.kind} name={request.user.name || ''} image={request.user.image || ''} />
          <p className='font-poppins font-semibold text-sm text-base-content'>{`${request.user.name}`}</p>
        </div>
      </div>
    </div>


  )
}

export default GeneralRequestCard
