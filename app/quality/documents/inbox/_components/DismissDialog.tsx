'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import useDialog from "@/hooks/useDialog"
import { dismissReasons } from "@/lib/documentInbox/types"
import { dismissDocument } from "../_actions"
import type { InboxRow } from "../_rows"

export const dismissDialogId = "inboxDismiss"

const choices = [dismissReasons.notADocument, dismissReasons.notForLumexia, dismissReasons.duplicate]

// Dismissed documents stay in the Dismissed view and can be restored; the same file arriving again is
// dismissed automatically.
const DismissDialogContent = ({ document }: { document: InboxRow }) => {
  const router = useRouter()
  const { resetDialogContext } = useDialog()
  const [choice, setChoice] = useState<string>(choices[0])
  const [other, setOther] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const reason = choice === "other" ? other.trim() : choice
    if (!reason) return setError("Say why it's being dismissed.")
    setSaving(true)
    setError(null)
    try {
      const result = await dismissDocument(document.id, reason)
      if (result.error) return setError(result.error)
      resetDialogContext()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Dismiss document</h2>
        <p className="truncate text-sm text-base-content/60">{document.fileName}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Why doesn&apos;t it belong in Lumexia?</legend>
        {[...choices, "other"].map((c) => (
          <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="dismissReason" className="radio radio-sm" checked={choice === c} onChange={() => setChoice(c)} />
            {c === "other" ? "Something else" : c}
          </label>
        ))}
        {choice === "other" && (
          <input autoFocus className="input input-sm w-full" value={other} onChange={(e) => setOther(e.target.value)} placeholder="Reason" />
        )}
      </fieldset>

      <p className="text-xs text-base-content/60">It stays under Dismissed and can be restored. If the same file arrives again, it&apos;s dismissed automatically.</p>

      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

      <div className="flex justify-end gap-2 border-t border-base-300 pt-4">
        <button type="button" onClick={resetDialogContext} className="btn btn-ghost">Cancel</button>
        <button type="button" onClick={save} disabled={saving} className="btn btn-error">
          {saving && <span className="loading loading-spinner loading-xs" />}
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default DismissDialogContent
