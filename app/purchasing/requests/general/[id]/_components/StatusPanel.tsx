'use client'
import { Panels } from "@/components/Panels"
import SectionTitle from "@/components/Text/SectionTitle"
import { GeneralRequest } from "../../_actions/getGeneralRequest"
import { GeneralRequestStatus } from "../../_actions/getAllGeneralRequestStatuses"
import useDialog from "@/hooks/useDialog"
import Dialog from "@/components/Dialog"
import prisma from "@/lib/prisma"
import { updateGeneralRequest } from "../../_actions/updateGeneralRequest"
import { useRouter } from "next/navigation"



const StatusPanel = ({ requestId, status, statuses }: { requestId: string, status: GeneralRequest['status'], statuses: GeneralRequestStatus[] }) => {

  const { showDialog, resetDialogContext } = useDialog()
  const router = useRouter()
  const handleStatusChange = async (statusId: string) => {
    await updateGeneralRequest(requestId, { statusId, })
    router.refresh()
    resetDialogContext()
  }
  return (
    <Panels.Root >
      <StatusDialog statuses={statuses} onStatusChange={handleStatusChange} />
      <SectionTitle size="small">Status</SectionTitle>

      <div className="flex flex-col gap-y-1">
        <div
          onClick={() => showDialog('changeRequestStatus')}
          className=" rounded-xl w-full h-40 p-6 flex items-center justify-center hover:cursor-pointer hover:opacity-80"
          style={{ backgroundColor: status.bgColor, color: status.textColor }}
        >
          {status.name}
        </div>
        <p className="font-poppins text-xs tracking-wide text-neutral-700 text-center">Change status by clicking above</p>
      </div>
    </Panels.Root>
  )
}

const StatusDialog = ({ onStatusChange, statuses }: { onStatusChange: (statusId: string) => void, statuses: GeneralRequestStatus[] }) => {

  return (
    <Dialog.Root identifier="changeRequestStatus">
      <Dialog.Title>Change Status To...</Dialog.Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => {
          return (
            <button key={status.id} style={{ backgroundColor: status.bgColor, color: status.textColor }} className='btn btn-neutral' onClick={() => onStatusChange(status.id)}>{status.name}</button>
          )
        })}
      </div>

    </Dialog.Root>

  )

}

export default StatusPanel
