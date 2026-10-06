'use client'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TbArchive, TbArrowBackUp, TbDots, TbExternalLink, TbFileDescription, TbPencil, TbTrash } from "react-icons/tb"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { handleDeleteFile } from "../../_actions/files/handleDeleteFile"
import { setItemDocumentReplaced } from "../../_actions/files/itemDocumentMutations"
import { useFilesActions } from "./FilesContext"

export const useDocumentCommands = (file: ItemFile) => {
  const router = useRouter()
  const { edit } = useFilesActions()
  return {
    edit: () => edit(file),
    toggleReplaced: async () => {
      await setItemDocumentReplaced(file.id, !file.supersededAt)
      router.refresh()
    },
    remove: async () => {
      if (!confirm(`Delete ${file.file.name}? This can't be undone.`)) return false
      await handleDeleteFile(file)
      router.refresh()
      return true
    },
  }
}

const DocumentMenu = ({ file }: { file: ItemFile }) => {
  const commands = useDocumentCommands(file)
  const close = () => (document.activeElement as HTMLElement | null)?.blur()

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Actions for ${file.file.name}`}>
        <TbDots />
      </div>
      <ul tabIndex={0} className="menu dropdown-content z-20 w-52 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
        <li><a href={file.url} target="_blank" rel="noopener noreferrer" onClick={close}><TbExternalLink /> Open</a></li>
        <li><button type="button" onClick={() => { close(); commands.edit() }}><TbPencil /> Edit details</button></li>
        <li><Link href={`/files/${file.fileId}`}><TbFileDescription /> File page &amp; tags</Link></li>
        <li>
          <button type="button" onClick={() => { close(); commands.toggleReplaced() }}>
            {file.supersededAt ? <><TbArrowBackUp /> Restore as current</> : <><TbArchive /> Mark as replaced</>}
          </button>
        </li>
        <li><button type="button" className="text-error" onClick={() => { close(); commands.remove() }}><TbTrash /> Delete</button></li>
      </ul>
    </div>
  )
}

export default DocumentMenu
