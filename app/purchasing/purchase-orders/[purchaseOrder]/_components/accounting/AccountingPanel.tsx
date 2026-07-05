import AccountingDetails from "@/app/accounting/pos/[po]/_components/AccountingDetails"
import AccountingFiles from "@/app/accounting/pos/[po]/_components/AccountingFiles"
import AccountingNotes from "@/app/accounting/pos/[po]/_components/AccountingNotes"
import AccountingStatus from "@/app/accounting/pos/[po]/_components/AccountingStatus"
import PaymentMethodPanel from "@/app/accounting/pos/[po]/_components/PaymentMethodPanel"
import Card from "@/components/Card"
import { Tabs } from "@/components/Tabs2"
import LabelCounter from "@/components/Tabs2/LabelCounter"
import SectionTitle from "@/components/Text/SectionTitle"
import { usePurchasingSelection } from "@/store/purchasingSlice"



const AccountingPanel = () => {

  const { poWithAccounting: accounting, files, options } = usePurchasingSelection()

  if (!accounting) return false;
  return (
    <div className="flex flex-col gap-4 w-full">
      <SectionTitle>Accounting</SectionTitle>


      <Tabs.Root defaultValue="details">
        <div className="flex justify-between items-center">
          <Tabs.List>
            <Tabs.Trigger size="sm" value="details">Details</Tabs.Trigger>
            <Tabs.Trigger size="sm" value="notes">
              <LabelCounter size="sm" label="Notes" count={accounting.poAccountingNotes.length} />
            </Tabs.Trigger>
            <Tabs.Trigger size="sm" value="files">
              <LabelCounter size="sm" label="Files" count={accounting.poAccountingFiles.length} />
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <div className="pt-4">
          <Tabs.ContentContainer>
            <Tabs.Content value="details">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AccountingDetails po={accounting} title="Process" />
                <AccountingStatus po={accounting} statuses={options.accountingStatuses} />
                <PaymentMethodPanel poId={accounting.id} paymentMethod={accounting.poAccountingDetail?.paymentMethod} allMethods={options.paymentMethods} accountingDetailId={accounting.poAccountingDetail?.id} />

              </div>
            </Tabs.Content>

            <Tabs.Content value="notes">
              <AccountingNotes notes={accounting.poAccountingNotes} noteTypes={options.accountingNoteTypes} poId={accounting.id} />
            </Tabs.Content>

            <Tabs.Content value="files">
              <AccountingFiles files={files} poId={accounting.id} fileTypes={options.fileTypes} />
            </Tabs.Content>

          </Tabs.ContentContainer>

        </div>
      </Tabs.Root>
    </div>
  )
}

export default AccountingPanel
