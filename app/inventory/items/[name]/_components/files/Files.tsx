'use client'
import { useMemo, useState } from "react"
import { TbUpload } from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { DocumentStatus, RequirementStatus } from "@/lib/itemDocuments/types"
import { FilesContext } from "./FilesContext"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { DocumentFormValue } from "./DocumentForm"
import DocumentDialog, { DocumentDialogState, documentDialogId } from "./DocumentDialog"
import DocumentLibrary from "./DocumentLibrary"
import DocumentPreview from "./DocumentPreview"
import LotDocumentsPanel from "./LotDocumentsPanel"
import RequirementsPanel from "./RequirementsPanel"
import { needsAttention, StatusBadge } from "@/components/ItemDocuments/presentation"

const attentionOrder: RequirementStatus[] = ["missing", "expired", "stale", "undated", "expiring"]
const rank = (s: DocumentStatus) => ["current", "expiring", "undated", "stale", "expired"].indexOf(s)

const Files = () => {
  const { documents, files } = useItemSelection()
  const { showDialog } = useDialog()
  const [dialog, setDialog] = useState<DocumentDialogState | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewFile = previewId ? files.find((f) => f.id === previewId) : undefined

  const actions = useMemo(() => ({
    upload: (prefill?: Partial<DocumentFormValue>) => {
      setDialog({ mode: "upload", prefill })
      showDialog(documentDialogId)
    },
    edit: (file: ItemFile) => {
      setDialog({ mode: "edit", file })
      showDialog(documentDialogId)
    },
    preview: (file: ItemFile) => setPreviewId(file.id),
  }), [showDialog])

  // a file can satisfy several requirements (or lots); show its best status
  const statusByFile = useMemo(() => {
    const map = new Map<string, DocumentStatus>()
    const add = (id: string, status: DocumentStatus) => {
      const current = map.get(id)
      if (current === undefined || rank(status) < rank(current)) map.set(id, status)
    }
    for (const r of documents.requirements) {
      r.documents.forEach((d) => add(d.documentId, d.status))
      r.lots?.forEach((l) => l.documents.forEach((d) => add(d.documentId, d.status)))
    }
    return map
  }, [documents])

  const required = documents.requirements.filter((r) => r.requirement.level === "required")
  const inOrder = required.filter((r) => !needsAttention(r.status)).length
  const attention = attentionOrder
    .map((status) => ({ status, count: required.filter((r) => r.status === status).length }))
    .filter((a) => a.count > 0)

  return (
    <FilesContext.Provider value={actions}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold">Documents</h2>
            {required.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                <span>
                  <span className="font-semibold text-base-content">{inOrder} of {required.length}</span> required documents in order
                </span>
                {attention.map((a) => (
                  <span key={a.status} className="flex items-center gap-1">
                    <StatusBadge status={a.status} size="xs" />
                    <span className="text-xs">×{a.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => actions.upload()} className="btn btn-primary">
            <TbUpload /> Upload
          </button>
        </div>

        <RequirementsPanel />
        <LotDocumentsPanel />
        <DocumentLibrary statusByFile={statusByFile} />
      </div>

      <DocumentDialog state={dialog} />
      {previewFile && (
        <DocumentPreview file={previewFile} status={statusByFile.get(previewFile.id)} onClose={() => setPreviewId(null)} />
      )}
    </FilesContext.Provider>
  )
}

export default Files
