'use client'
import { useRouter } from "next/navigation"
import { useSupplierDetailSelection } from "@/store/supplierDetailSlice"
import { archiveSupplier } from "../../_actions/archiveSupplier"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import Alert from "@/components/Alert"
import useDialog from "@/hooks/useDialog"
import SectionTitle from "@/components/Text/SectionTitle"
import Card from "@/components/Card"

const ArchiveSupplierButton = () => {

  const { supplier } = useSupplierDetailSelection()
  const router = useRouter()
  const { showDialog, resetDialogContext } = useDialog()

  const handleArchive = async () => {
    if (!supplier) return;

    await archiveSupplier(supplier.id)
    await createActivityLog('Archive Supplier', 'supplier', supplier.id, { context: 'Archived the supplier' })
    router.push('/purchasing/suppliers')
    resetDialogContext()
  }
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Archive Supplier</SectionTitle>

      <Card.Root>
        <div className="flex items-center justify-between gap-4">
          <div className="font-poppins text-xl font-medium text-base-content">
            This will effectively delete this supplier. Use with extreme caution.
          </div>

          <button onClick={() => showDialog('archiveSupplier')} className="btn btn-error btn-outline">Archive Supplier</button>
        </div>
      </Card.Root>
      <Alert.Root identifier="archiveSupplier">
        <Alert.Content
          title="Archive Supplier"
          action={handleArchive}
          actionLabel="Archive"
          actionColor="error"
          cancelAction={resetDialogContext}
        >
          Are you sure you want to archive this supplier? This action cannot be undone.
        </Alert.Content>
      </Alert.Root>
    </div>
  )
}

export default ArchiveSupplierButton
