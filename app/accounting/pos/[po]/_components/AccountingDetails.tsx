'use client'
import { Panels } from "@/components/Panels"
import SectionTitle from "@/components/Text/SectionTitle"
import { PoWithAccounting } from "../../_actions/getPoWithAccountingDetails"
import { accountingActions } from "@/actions/accounting"
import { useRouter } from "next/navigation"
import { createAccountingAuditLog } from "../../_actions/createAccountingAuditLog"
import { getUserId } from "@/actions/users/getUserId"

const AccountingDetails = ({ po, title = 'Accounting' }: { po: PoWithAccounting, title?: string }) => {

  const router = useRouter();
  const handleChange = async (fieldName: string, value: boolean) => {

    if (!po.poAccountingDetail) return;

    const userId = await getUserId();

    await accountingActions.pos.details.update(po.poAccountingDetail.id, {
      [fieldName]: value,
    })

    await createAccountingAuditLog({
      poId: po.id,
      userId,
      action: 'Modify Accounting Details',
      context: `${fieldName} was changed to ${value}`,
    })


    router.refresh()
  }


  return (
    <Panels.Root>
      <SectionTitle size="small">{title}</SectionTitle>


      <div className="grid grid-cols-1 gap-2">

        <DetailRow label="Paid" fieldName="paid" onDetailChange={handleChange} value={po.poAccountingDetail?.paid || false} />

        <DetailRow label="Packing Slip" fieldName="packingSlipReceived" onDetailChange={handleChange} value={po.poAccountingDetail?.packingSlipReceived || false} />

        <DetailRow label="Invoice" fieldName="paperworkGivenToAdmin" onDetailChange={handleChange} value={po.poAccountingDetail?.paperworkGivenToAdmin || false} />
      </div>


    </Panels.Root>
  )
}

const DetailRow = ({ label, value, fieldName, onDetailChange }: { label: string, value: boolean, fieldName: string, onDetailChange: (fieldName: string, value: boolean) => void }) => {

  const buttonBase = 'btn min-w-20 btn-lg';
  const unseletedButton = 'btn-outline hover:cursor-pointer'


  return (
    <div className="flex justify-between items-center p-4 rounded-xl">

      <div className="font-poppins text-xl font-semibold">
        {label}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`${buttonBase} ${value ? 'btn-success hover:cursor-not-allowed ' : unseletedButton}`}
          onClick={() => onDetailChange(fieldName, true)}
        >
          Yes
        </div>

        <div
          className={`${buttonBase} ${!value ? 'btn-error hover:cursor-not-allowed ' : unseletedButton}`}

          onClick={() => onDetailChange(fieldName, false)}
        >
          No
        </div>
      </div>

    </div>
  )
}




export default AccountingDetails
