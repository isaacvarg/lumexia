'use client'
import SectionTitle from "@/components/Text/SectionTitle"
import { AccountingFile } from "../../_actions/getAccountingFilesByPo"
import Uploader from "@/components/Uploader/Uploader"
import { FileResponseData } from "@/app/api/upload/route"
import { createPoAccountingFile } from "../../_actions/createPoAccountingFile"
import { useRouter } from "next/navigation"
import { AccountingFileTypes } from "../../_actions/getAccountingFileTags"
import { deleteAccountingFile } from "../../_actions/deleteAccountingFile"
import { createAccountingAuditLog } from "../../_actions/createAccountingAuditLog"
import { getUserId } from "@/actions/users/getUserId"
import Card from "@/components/Card"
import FileButton2 from "@/components/Uploader/FileButton2"

const AccountingFiles = ({ files, poId, fileTypes, span = 2 }: { files: AccountingFile[], poId: string, fileTypes: AccountingFileTypes[], span?: 1 | 2 | 3 }) => {

  const router = useRouter();


  const handleComplete = async (data: FileResponseData) => {
    const userId = await getUserId()
    await createPoAccountingFile({
      fileTypeId: '9b24e26b-3ce5-469b-96a2-37ebe779b783',
      fileId: data.fileId,
      purchaseOrderId: poId,
    })

    await createAccountingAuditLog({
      poId: poId,
      userId,
      action: 'Add File',
      context: `${data.name} was added.`
    })

    router.refresh();
  }

  const handleDelete = async (file: AccountingFile) => {

    const userId = await getUserId()

    await deleteAccountingFile(file)
    await createAccountingAuditLog({
      poId,
      userId,
      action: 'Remove File',
      context: `${file.file.name} was deleted.`
    })

    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Card.Root>
          <SectionTitle size="small">Upload</SectionTitle>
          <Uploader pathPrefix="/accounting/pos" onComplete={handleComplete} />
        </Card.Root>
      </div>

      <div className="flex flex-col gap-2">
        <Card.Root>
          <SectionTitle size="small">Files</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

            {files.map(file => {
              return (
                <FileButton2 key={file.id} file={file} onDeleteClick={() => handleDelete(file)} />
              )
            })}

          </div>
        </Card.Root>
      </div>
    </div>
  )
}

export default AccountingFiles
