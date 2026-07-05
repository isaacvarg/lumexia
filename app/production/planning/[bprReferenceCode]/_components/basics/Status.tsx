'use client'
import { handleCompletedBprCascade } from "@/actions/queries/completedBprs/handleCompletedBprCascasde"
import { bprStatuses } from "@/configs/staticRecords/bprStatuses"
import useDialog from "@/hooks/useDialog"
import useToast from "@/hooks/useToast"
import { useBprDetailsSelection } from "@/store/bprDetailsSlice"
import { useRouter } from "next/navigation"
import { useState } from "react"
import ChangeStatusDialog from "./StatusDialog"
import Card from "@/components/Card"

const Statuses = () => {

  const { bpr } = useBprDetailsSelection()
  const { showDialog } = useDialog()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusClick = () => {
    showDialog('changeBprStatus')
  }

  const retryConsumption = async () => {
    if (!bpr) return
    try {
      setIsLoading(true)
      await handleCompletedBprCascade(bpr.id)
      toast("Consumption Successful", "BPR consumption cascade completed successfully", "success")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast("Consumption Failed", "Failed to execute BPR consumption cascade — check BPR notes for details", "error")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card.Root>
      <ChangeStatusDialog />
      <Card.Title size="small">Status</Card.Title>


      <div
        onClick={() => handleStatusClick()}
        style={{ backgroundColor: bpr?.status.bgColor }}
        className="flex flex-col h-full items-center justify-center px-4 py-2 rounded-xl col-span-1 sm:col-span-2 hover:!bg-lilac-300 hover:cursor-pointer"
      >
        <div style={{ color: bpr?.status.textColor }} className=" font-poppins text-3xl font-semibold">
          {bpr?.status.name || 'None'}
        </div>
      </div>

      {bpr?.bprStatusId === bprStatuses.consumptionError && (
        <button
          onClick={() => retryConsumption()}
          className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'} mt-2 col-span-1 sm:col-span-2`}
        >
          {isLoading ? 'Retrying...' : 'Retry Consumption'}
        </button>
      )}






    </Card.Root>

  )

}

export default Statuses
