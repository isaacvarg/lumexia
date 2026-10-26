'use client'
import { createContext, useContext } from "react"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { DocumentFormValue } from "./DocumentForm"

type FilesActions = {
  upload: (prefill?: Partial<DocumentFormValue>) => void
  edit: (file: ItemFile) => void
  preview: (file: ItemFile) => void
  // use another item's document of this type until this item has its own
  chooseSurrogate: (fileTypeId: string) => void
}

export const FilesContext = createContext<FilesActions | null>(null)

export const useFilesActions = () => {
  const ctx = useContext(FilesContext)
  if (!ctx) throw new Error("useFilesActions must be used inside the Files tab")
  return ctx
}
