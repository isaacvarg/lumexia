'use client'
import { useState } from "react"
import useToast from "@/hooks/useToast"
import { canonActions } from "@/actions/canon"
import type { CanonEntry } from "@/lib/canon/queries"
import { getShapeKey } from "@/lib/canon/shapes"
import DiffView from "./DiffView"

// Two small flows that share a layout: accepting a linked source's value,
// and confirming an artifact is still right after something upstream changed.
const ReviewSourceForm = ({ entry, mode, onDone }: { entry: CanonEntry; mode: "accept" | "confirm"; onDone: () => void }) => {
  const { toast } = useToast()
  const { dataType, artifact, live, subject } = entry
  const shapeKey = getShapeKey(dataType.shapeId)
  const accepted = artifact?.currentVersion?.content ?? null
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!reason.trim()) {
      toast("Missing reason", mode === "accept" ? "Say why this source value is right." : "Say why it's still valid.", "error")
      return
    }
    setSubmitting(true)
    try {
      const cr = mode === "accept"
        ? await canonActions.changeRequests.acceptSource({ dataTypeId: dataType.id, subject, reason })
        : await canonActions.changeRequests.confirmStale({ artifactId: artifact!.id, reason })
      if (cr.version) toast("Done", `${dataType.name} is now v${cr.version.versionNumber}.`, "success")
      else toast("Sent for review", "Another reviewer needs to approve this.", "success")
      onDone()
    } catch (e) {
      toast("Could not submit", (e as Error).message, "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {mode === "accept" ? (accepted ? "Review source change" : "Accept source") : "Confirm still valid"}: {dataType.name}
        </h2>
        <p className="text-base-content/60">
          {mode === "accept"
            ? "The value below comes straight from Lumexia. Accepting it makes it the canon, and anything that depends on it will be asked to review."
            : "Something this depends on changed. If the current value is still right, confirm it. Otherwise, propose a change instead."}
        </p>
      </div>

      {mode === "accept" && live !== null && (
        <section className="flex flex-col gap-2">
          <h3 className="font-semibold">{accepted ? `Changes since v${artifact?.currentVersion?.versionNumber}` : "Source value"}</h3>
          <DiffView shapeKey={shapeKey} before={accepted} after={live} />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Reason</h3>
        <textarea className="textarea w-full" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </section>

      <div className="flex justify-end">
        <button onClick={submit} disabled={submitting} className="btn btn-success">
          {submitting ? "Submitting..." : mode === "accept" ? "Accept" : "Confirm"}
        </button>
      </div>
    </div>
  )
}

export default ReviewSourceForm
