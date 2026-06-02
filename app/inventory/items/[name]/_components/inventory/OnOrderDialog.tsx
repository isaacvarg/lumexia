import Dialog from "@/components/Dialog"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { dateFormatString } from "@/configs/data/dateFormatString"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { DateTime } from "luxon"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getOnOrderContributions, OnOrderContribution } from "../../_actions/purchasing/getOnOrderContributions"

export const onOrderDialog = "onOrder"

const formatDeliveryWindow = (request: OnOrderContribution['request']) => {
  if (!request) return '—'
  const start = request.expectedDateStart
    ? DateTime.fromJSDate(new Date(request.expectedDateStart)).toFormat(dateFormatString)
    : null
  const end = request.expectedDateEnd
    ? DateTime.fromJSDate(new Date(request.expectedDateEnd)).toFormat(dateFormatString)
    : null

  if (start && end) return start === end ? start : `${start} – ${end}`
  return start ?? end ?? '—'
}

const OnOrderContent = () => {
  const { item } = useItemSelection()
  const { resetDialogContext } = useDialog()
  const router = useRouter()

  const [rows, setRows] = useState<OnOrderContribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!item) return
    setIsLoading(true)
    getOnOrderContributions(item.id)
      .then((data) => { if (active) setRows(data) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [item])

  const handleClick = (row: OnOrderContribution) => {
    resetDialogContext()
    if (row.request) {
      router.push(`/purchasing/requests/${row.request.referenceCode}?id=${row.request.id}`)
    } else {
      router.push(`/purchasing/purchase-orders/${row.poReferenceCode}?id=${row.poId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner" />
      </div>
    )
  }

  if (rows.length === 0) {
    return <div className="py-8 text-center text-base-content/60">No open purchase orders contributing to on-order quantity.</div>
  }

  return (
    <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pt-2">
      {rows.map((row) => (
        <div
          key={row.poItemId}
          className="flex justify-between items-center gap-4 px-4 py-3 rounded-xl bg-accent/25 hover:bg-accent/20 hover:cursor-pointer"
          onClick={() => handleClick(row)}
        >
          <div className="flex flex-col">
            <span className="font-semibold text-base-content">PO #{row.poReferenceCode}</span>
            <span className="text-sm text-base-content/60">{row.supplierName} · {row.statusName}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="font-medium text-base-content">
              {toFracitonalDigits.weight(row.quantity)} {row.uomAbbreviation}
            </span>
            <span className="text-sm text-base-content/60">{formatDeliveryWindow(row.request)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const OnOrderDialog = () => (
  <Dialog.Root identifier={onOrderDialog}>
    <Dialog.Title>On Order — Purchase Orders</Dialog.Title>
    <OnOrderContent />
  </Dialog.Root>
)

export default OnOrderDialog
