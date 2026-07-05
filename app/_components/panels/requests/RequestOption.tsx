'use client'
import { PurchasingRequest } from "@/actions/purchasing/requests/getByStatus"
import { useRouter } from "next/navigation"
import UserIcon from "@/components/UI/UserIcon"

const RequestOption = ({ req }: { req: PurchasingRequest }) => {

  const path = `/purchasing/requests/${req.referenceCode}?id=${req.id}`
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(path)}
      className="flex flex-col gap-2 py-3 px-4 rounded-xl bg-base-300/75 hover:cursor-pointer hover:bg-base-200">

      <h1 className="font-poppins text-base text-base-content font-medium break-words">{req.item.name}</h1>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-center items-center flex rounded-xl px-2 py-1 font-semibold text-sm font-poppins whitespace-nowrap" style={{ backgroundColor: req.priority.bgColor, color: req.priority.textColor }}>{req.priority.name}</h2>
        </div>
        <span className="shrink-0">
          <UserIcon image={req.requestingUser.image ?? undefined} name={req.requestingUser.name ?? undefined} />
        </span>
      </div>

    </div>

  )
}

export default RequestOption
