import { TbFileTypePdf } from "react-icons/tb"
import Tag from "../Text/Tag"
import ContextMenu from "../ContextMenu"
import Image from "next/image"

type FileTag = {
    label: string
    bgColor: string
    textColor: string
    tooltip?: string
}

type FileButtonProps = {
    // file stuff
    label: string
    url: string
    mimeType: string
    fileTag?: FileTag
    uploadedByName?: string
    uploadedByImage?: string
    thumbnailUrl?: string
    // styling stuff
    size?: keyof typeof classes.size
    color?: keyof typeof classes.color
    shape?: keyof typeof classes.shape
    // editing methods
    onEditClick: () => void;
    onDeleteClick: () => void;
}

const classes = {
    shape: {
        default: "flex flex-row rounded-xl items-center hover:cursor-pointer h-full ",
        vertical: 'flex flex-col rounded-xl items-center hover:cursor-pointer h-full',
    },
    textBase: "font-poppins text-lg font-medium",
    size: {
        default: 'py-2 px-4'
    },
    color: {
        default: 'bg-white hover:bg-neutral-200/80'
    },
    buttonSpacing: {
        default: 'flex gap-x-4 items-center',
        vertical: 'flex flex-col gap-y-4 items-center py-8',
    }
}



const FileButton = ({ label, url, mimeType, size = 'default', color = 'default', shape = 'default', fileTag, onEditClick, onDeleteClick, uploadedByName, uploadedByImage, thumbnailUrl }: FileButtonProps) => {

    const isPdf = mimeType === 'application/pdf'
    const imageUrl = thumbnailUrl || url


    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <div className={`${classes.shape[shape]} ${classes.size[size]} ${classes.color[color]}`} >
                        <div className={`${shape === 'default' ? classes.buttonSpacing.default : classes.buttonSpacing.vertical}`}>

                            {isPdf && thumbnailUrl && <Image className="w-16 h-16 rounded-lg object-cover" src={thumbnailUrl} alt={label} width={64} height={64} unoptimized />}
                            {isPdf && !thumbnailUrl && (<div className="flex items-center justify-center rounded-full w-16 h-16 bg-neutral-400 p-6">
                                <span className="text-5xl text-white"><TbFileTypePdf /></span>
                            </div>)}
                            {!isPdf && <Image className="w-16 h-16 rounded-full object-cover" src={imageUrl} alt={label} width={64} height={64} unoptimized />}
                            <p className={`${classes.textBase}`}>{label}</p>


                            <div className="flex gap-x-2 items-center justify-center">
                                {fileTag && <Tag tooltip={fileTag?.tooltip || fileTag.label} bgColor={fileTag.bgColor} textColor={fileTag.textColor} label={fileTag.label} />}
                                {(uploadedByName && uploadedByImage) && <div className="tooltip" data-tip={uploadedByName} ><Image src={uploadedByImage} className="rounded-full h-12 w-12 " alt={uploadedByName} width={48} height={48} unoptimized /></div>}
                            </div>
                        </div>

                    </div>
                </a >
            </ContextMenu.Trigger>

            <ContextMenu.Content>

                <ContextMenu.Item onClick={() => onEditClick()}>
                    Edit
                </ContextMenu.Item>
                <ContextMenu.Item onClick={() => onDeleteClick()}>
                    Delete
                </ContextMenu.Item>
            </ContextMenu.Content>
        </ContextMenu.Root>
    )
}

export default FileButton
