'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TbCheck, TbFile } from "react-icons/tb"
import Dialog from "@/components/Dialog"
import Uploader from "@/components/Uploader/Uploader"
import useDialog from "@/hooks/useDialog"
import { FileResponseData } from "@/app/api/upload/route"
import { getAllTags, TagOption } from "@/app/files/[fileId]/_actions/getAllTags"
import { addFileTag } from "@/app/files/[fileId]/_actions/addFileTag"
import { useItemSelection } from "@/store/itemSlice"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { createItemDocuments, updateItemDocument } from "../../_actions/files/itemDocumentMutations"
import DocumentForm, { DocumentFormValue, emptyDocumentForm, fromDocumentForm, toDocumentForm, useDocumentExpectations, validateDocumentForm } from "./DocumentForm"

export const documentDialogId = "itemDocumentDialog"

export type DocumentDialogState =
  | { mode: "upload"; prefill?: Partial<DocumentFormValue> }
  | { mode: "edit"; file: ItemFile }

const DocumentDialog = ({ state }: { state: DocumentDialogState | null }) => (
  <Dialog.Root identifier={documentDialogId} contentClassName="max-h-[92vh] w-[95vw] max-w-3xl">
    {state && <DocumentDialogContent key={state.mode === "edit" ? state.file.id : "upload"} state={state} />}
  </Dialog.Root>
)

const DocumentDialogContent = ({ state }: { state: DocumentDialogState }) => {
  const router = useRouter()
  const { resetDialogContext } = useDialog()
  const { item } = useItemSelection()
  const [uploaded, setUploaded] = useState<FileResponseData[]>([])
  const [value, setValue] = useState<DocumentFormValue>(
    state.mode === "edit" ? toDocumentForm(state.file) : { ...emptyDocumentForm, ...state.prefill }
  )
  const [tags, setTags] = useState<TagOption[]>([])
  const [tagIds, setTagIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const expectations = useDocumentExpectations(value)

  const editing = state.mode === "edit"
  const needsFiles = !editing && uploaded.length === 0

  useEffect(() => {
    if (!editing) getAllTags().then((t) => setTags(t ?? [])).catch(() => setTags([]))
  }, [editing])

  const toggleTag = (id: string) =>
    setTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const save = async () => {
    if (!item) return
    const problem = validateDocumentForm(value, expectations)
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (state.mode === "edit") {
        await updateItemDocument(state.file.id, fromDocumentForm(value))
      } else {
        await createItemDocuments(item.id, uploaded.map((f) => ({ fileId: f.fileId, name: f.name })), fromDocumentForm(value))
        await Promise.all(
          uploaded.flatMap((f) => Array.from(tagIds).map((tagId) => addFileTag({ fileId: f.fileId, tagId })))
        )
      }
      resetDialogContext()
      router.refresh()
    } catch {
      setError("Couldn't save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">{editing ? "Document details" : "Upload documents"}</h2>
        <p className="text-sm text-base-content/60">
          {editing
            ? state.file.file.name
            : needsFiles
              ? "Drop one or more PDFs or images. Files uploaded together share the details below."
              : "Check the details so these count toward the item's requirements."}
        </p>
      </div>

      {needsFiles ? (
        <Uploader pathPrefix="/item/" multiple onMultipleComplete={setUploaded} />
      ) : (
        !editing && (
          <ul className="flex flex-col gap-1 rounded-lg bg-base-200 p-3 text-sm">
            {uploaded.map((f) => (
              <li key={f.fileId} className="flex items-center gap-2">
                <TbCheck className="size-4 shrink-0 text-success" />
                <TbFile className="size-4 shrink-0 text-base-content/50" />
                <span className="truncate">{f.name}</span>
              </li>
            ))}
          </ul>
        )
      )}

      <DocumentForm value={value} onChange={setValue} editingId={editing ? state.file.id : undefined} />

      {!editing && tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Tags (optional)</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tagIds.has(t.id)}
                onClick={() => toggleTag(t.id)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${tagIds.has(t.id) ? "ring-2 ring-accent ring-offset-1" : "opacity-60 hover:opacity-100"}`}
                style={{ backgroundColor: t.bgColor, color: t.textColor }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <div className="flex justify-end gap-2 border-t border-base-300 pt-4">
        <button type="button" onClick={resetDialogContext} className="btn btn-ghost">Cancel</button>
        <button type="button" onClick={save} disabled={saving || needsFiles} className="btn btn-primary">
          {saving && <span className="loading loading-spinner loading-xs" />}
          {editing ? "Save details" : uploaded.length > 1 ? `Save ${uploaded.length} documents` : "Save document"}
        </button>
      </div>
    </div>
  )
}

export default DocumentDialog
