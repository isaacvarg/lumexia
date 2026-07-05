'use client'
import { ReviewablePricingExams } from "@/actions/accounting/pricing/getReviewable"
import { PurchasingRequest } from "@/actions/purchasing/requests/getByStatus"
import { dateFormatString } from "@/configs/data/dateFormatString"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import UserIcon from "@/components/UI/UserIcon"

const PricingOption = ({ exam }: { exam: ReviewablePricingExams }) => {

  const path = `/accounting/pricing/details?id=${exam.id}`
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(path)}
      className="flex flex-col gap-2 py-3 px-4 rounded-xl bg-base-300/75 hover:cursor-pointer hover:bg-base-200">

      <h1 className="font-poppins text-base text-base-content font-medium break-words">{exam.examinedItem.name}</h1>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-center items-center flex rounded-xl px-2 py-1 font-semibold bg-secondary/70 text-secondary-content text-sm font-poppins whitespace-nowrap">
            {DateTime.fromJSDate(exam.createdAt).toFormat(dateFormatString)}
          </h2>
        </div>
        <span className="shrink-0">
          <UserIcon image={exam.user.image ?? undefined} name={exam.user.name ?? undefined} />
        </span>
      </div>

    </div>

  )
}

export default PricingOption
