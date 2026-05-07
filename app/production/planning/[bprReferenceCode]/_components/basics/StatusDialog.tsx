"use client"
import Dialog from "@/components/Dialog"
import useDialog from "@/hooks/useDialog"
import { useBprDetailsSelection } from "@/store/bprDetailsSlice"
import { useRouter } from "next/navigation"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { overrideBprStatus } from "@/lib/bpr/overrideBprStatus"


const StatusDialog = () => {

  const { bpr, options } = useBprDetailsSelection();
  const router = useRouter();
  const { resetDialogContext } = useDialog()
  const statuses = new Map(options.bprStatuses.map(s => [s.id, s.name]))

  const handleClick = async (statusId: string) => {

    if (!bpr) return;
    await overrideBprStatus(bpr.id, statusId)
    const selectedStatus = statuses.get(statusId)
    resetDialogContext()
    await createActivityLog('Modify Statuts', 'bpr', bpr.id, { context: `Status changed to ${selectedStatus}` })
    router.refresh()
  }

  return (
    <Dialog.Root identifier="changeBprStatus">
      <Dialog.Title>Change Status To...</Dialog.Title>

      <div className="grid grid-cols-4 gap-4">
        {options.bprStatuses.map((status) => {
          return (
            <button key={status.id} style={{ backgroundColor: status.bgColor, color: status.textColor }} className='btn btn-neutral' onClick={() => handleClick(status.id)}>{status.name}</button>
          )
        })}
      </div>

    </Dialog.Root>
  )
}

export default StatusDialog
