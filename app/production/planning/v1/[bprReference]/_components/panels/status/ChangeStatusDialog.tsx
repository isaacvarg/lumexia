"use client"
import Dialog from "@/components/Dialog"
import { BprStatus } from "@/types/bprStatus"
import { revalidatePage } from "@/actions/app/revalidatePage"
import useDialog from "@/hooks/useDialog"
import { overrideBprStatus } from "@/lib/bpr/overrideBprStatus"
import { usePlanningDashboardActions, usePlanningDashboardSelection } from "@/store/planningDashboardSlice"


const ChangeStatusDialog = () => {

  const { bpr, bprStatuses } = usePlanningDashboardSelection()
  const { getBpr } = usePlanningDashboardActions()
  const { resetDialogContext } = useDialog()

  const handleClick = async (statusId: string) => {

    if (!bpr) return;
    await overrideBprStatus(bpr.id, statusId)
    getBpr(bpr.id)
    resetDialogContext()
  }

  return (
    <Dialog.Root identifier="changeBprStatus">
      <Dialog.Title>Change Status To...</Dialog.Title>

      <div className="grid grid-cols-4 gap-4">
        {bprStatuses.map((status) => {
          return (
            <button key={status.id} style={{ backgroundColor: status.bgColor, color: status.textColor }} className='btn btn-neutral' onClick={() => handleClick(status.id)}>{status.name}</button>
          )
        })}
      </div>

    </Dialog.Root>
  )
}

export default ChangeStatusDialog
