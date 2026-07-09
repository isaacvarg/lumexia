import { FileWithThumbnail } from "@/app/accounting/pos/_actions/getAccountingFilesByPo";
import Image from "next/image";
import Tag from "../Text/Tag";
import { TbTrash } from "react-icons/tb";
import { Fragment } from "react";
import Alert from "../Alert";
import useDialog from "@/hooks/useDialog";

const FileButton2 = ({ file, onDeleteClick }: { file: FileWithThumbnail, onDeleteClick: () => void }) => {
  const { showDialog } = useDialog();
  let type: string = 'unknown';

  if (file.file.mimeType === 'application/pdf') { type = 'pdf' }
  if (file.file.mimeType.startsWith('image/')) { type = 'image' }

  const { name: uploadedByName, image: uploadedByImage } = file.file.uploadedBy;


  return (
    <Fragment>
      <Alert.Root identifier={`delete-file-${file.file.id}`}>

        <Alert.Content
          title="Confirm Deletion"
          actionLabel="Delete"
          actionColor="error"
          action={onDeleteClick}
          cancelAction={() => { }}
        >
          Are you sure you want to delete this file? This action cannot be undone.
        </Alert.Content>
      </Alert.Root>

      <a href={file.url} target="_blank" rel="noopener noreferrer">
        <div
          className="bg-primary/20 hover:bg-primary/40 hover:cursor-pointer shadow-lg flex p-6 rounded-lg flex-row justify-items-start items-center gap-x-6 h-full"
        >
          <Image className="w-24 h-32 rounded-lg object-cover" src={file.thumbnailUrl || ''} alt={file.file.name} width={400} height={600} unoptimized />

          <div className="flex flex-col gap-2 h-full w-full justify-start">

            <div className="flex justify-between">
              <div className="flex items-center gap-x-6">
                <div>
                  <Tag
                    text={'normal'}
                    color="accent"
                    label={type}
                    tooltip={"File Extension"}
                  />
                </div>

                <div>
                  <Tag
                    text={'normal'}
                    bgColor={file.fileType.bgColor}
                    textColor={file.fileType.textColor}
                    label={file.fileType.name}
                    tooltip={'File Type'}
                  />
                </div>


                {(uploadedByName && uploadedByImage) && <div className="tooltip" data-tip={uploadedByName} ><Image src={uploadedByImage} className="rounded-full h-12 w-12 " alt={uploadedByName} width={48} height={48} unoptimized /></div>}

              </div>

              <div className="flex items-center gap-x-2">
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); showDialog(`delete-file-${file.file.id}`); }} className="btn btn-error btn-ghost btn-sm"> <TbTrash className="size-4" /></button>
              </div>

            </div>

            <div className="font-poppins text-lg text-base-content font-medium">
              {file.file.name}
            </div>

          </div>
        </div>
      </a>

    </Fragment>
  )
}

export default FileButton2
