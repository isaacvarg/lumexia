'use client'
import { Panels } from "@/components/Panels"
import SectionTitle from "@/components/Text/SectionTitle"
import { PoAccountingStatus } from "../../_actions/getAllAccountingStatuses"
import { PoWithAccounting } from "../../_actions/getPoWithAccountingDetails"
import { accountingActions } from "@/actions/accounting"
import { useRouter } from "next/navigation"
import { getUserId } from "@/actions/users/getUserId"
import { createAccountingAuditLog } from "../../_actions/createAccountingAuditLog"
import { Dispatch, SetStateAction, useState } from "react"

const AccountingStatus = ({ statuses, po }: { statuses: PoAccountingStatus[], po: PoWithAccounting }) => {

  const [isModifyMode, setIsModifyMode] = useState(false);

  return (
    <Panels.Root >

      <SectionTitle size="small">Accounting Status</SectionTitle>

      {isModifyMode && (<ChooseStatusMode statuses={statuses} poAccountingDetailsId={po.poAccountingDetail?.id} poId={po.id} resetStatusMode={setIsModifyMode} />)}


      {!isModifyMode && (
        <div
          onClick={() => setIsModifyMode(true)}
          className="w-full h-full p-6 flex items-center justify-center hover:cursor-pointer hover:bg-opacity-20 rounded-xl"
          style={{ backgroundColor: po.poAccountingDetail?.status.bgColor, color: po.poAccountingDetail?.status.textColor }}
        >
          <p className="font-poppins text-4xl font-semibold text-center">
            {po.poAccountingDetail?.status.name || 'No Status'}
          </p>
        </div>

      )}

    </Panels.Root>
  )
}

const ChooseStatusMode = ({
  statuses,
  poAccountingDetailsId,
  poId,
  resetStatusMode,
}: {
  statuses: PoAccountingStatus[],
  poAccountingDetailsId: string | undefined,
  poId: string,
  resetStatusMode: Dispatch<SetStateAction<boolean>>,
}) => {


  const router = useRouter()

  const handleClick = async (statusId: string, statusName: string) => {
    if (!poAccountingDetailsId) return;
    const userId = await getUserId()
    await accountingActions.pos.details.update(poAccountingDetailsId, {
      statusId,
    })
    await createAccountingAuditLog({
      poId,
      userId,
      action: 'Change Status',
      context: `Status changed to ${statusName}`
    })

    resetStatusMode(false);
    router.refresh();

  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-poppins text-lg text-base-content font-medium">Change status to:</p>
        <button onClick={() => resetStatusMode(false)} className="btn btn-error btn-outline btn-md">Cancel</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statuses.map((status) => {
          return (
            <button key={status.id} style={{ backgroundColor: status.bgColor, color: status.textColor }} className='btn btn-neutral' onClick={() => handleClick(status.id, status.name)}>{status.name}</button>
          )
        })}
      </div>

    </div>

  )

}

export default AccountingStatus
