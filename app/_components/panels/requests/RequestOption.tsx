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
      className="flex justify-between items-center py-2 px-4 rounded-xl bg-base-300/75 hover:cursor-pointer hover:bg-base-200">

      <h1 className="font-poppins text-base  text-base-content font-medium">{req.item.name}</h1>

      <div className="flex gap-x-2">
        <h2 className="text-center items-center flex rounded-xl px-2 py-1 font-semibold text-sm font-poppins" style={{ backgroundColor: req.priority.bgColor, color: req.priority.textColor }}>{req.priority.name}</h2>
        <UserIcon image={req.requestingUser.image ?? undefined} name={req.requestingUser.name ?? undefined} />
      </div>

    </div>

  )
}

export default RequestOption
