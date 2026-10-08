'use client'
import { TbCheck, TbChecks, TbMinus, TbPhoto, TbX } from "react-icons/tb"
import { CheckAnswer, failedChecks, receivingChecks } from "@/lib/receiving/checks"
import CaptureButtons from "./CaptureButtons"
import { LineDraft } from "./draft"

const answerButtons: { answer: CheckAnswer; label: string; icon: typeof TbCheck; active: string }[] = [
  { answer: "pass", label: "OK", icon: TbCheck, active: "btn-success" },
  { answer: "fail", label: "Problem", icon: TbX, active: "btn-error" },
  { answer: "na", label: "N/A", icon: TbMinus, active: "btn-neutral" },
]

type Props = { line: LineDraft; onChange: (line: LineDraft) => void }

const InspectStep = ({ line, onChange }: Props) => {
  const failed = failedChecks(line.checks)
  const setAnswer = (key: string, answer: CheckAnswer) => onChange({ ...line, checks: { ...line.checks, [key]: answer } })
  const allOk = () =>
    onChange({ ...line, checks: Object.fromEntries(receivingChecks.map((c) => [c.key, line.checks[c.key] === "na" ? "na" : "pass"])) })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base-content/70">Look over every container, not just the top layer.</p>
        <button type="button" className="btn btn-lg btn-success btn-soft" onClick={allOk}>
          <TbChecks className="size-6" /> Everything looks OK
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-base-300 rounded-box border border-base-300">
        {receivingChecks.map((check) => (
          <li key={check.key} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">{check.label}</div>
              <div className="text-base-content/60">{check.prompt}</div>
            </div>
            <div className="join shrink-0">
              {answerButtons
                .filter((b) => b.answer !== "na" || check.allowNa)
                .map((b) => {
                  const active = line.checks[check.key] === b.answer
                  const Icon = b.icon
                  return (
                    <button
                      key={b.answer}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAnswer(check.key, b.answer)}
                      className={`btn btn-lg join-item min-w-28 ${active ? b.active : "btn-ghost border-base-300"}`}
                    >
                      <Icon className="size-5" /> {b.label}
                    </button>
                  )
                })}
            </div>
          </li>
        ))}
      </ul>

      {failed.length > 0 && (
        <div className="flex flex-col gap-3 rounded-box border-2 border-error/40 bg-error/5 p-4">
          <label className="flex flex-col gap-2">
            <span className="text-lg font-semibold">What&apos;s wrong? <span className="text-error">*</span></span>
            <span className="text-base-content/60">
              {failed.map((c) => c.label).join(", ")}. Say which containers and what you saw. It&apos;s still received, and flagged for review.
            </span>
            <textarea
              className="textarea textarea-lg w-full"
              rows={3}
              value={line.issueNote}
              onChange={(e) => onChange({ ...line, issueNote: e.target.value })}
              placeholder="e.g. 2 of 8 pails dented, one lid seal broken"
            />
          </label>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-lg font-semibold">
          Photos {failed.length > 0 ? <span className="text-sm font-normal text-base-content/60">(please add one of the problem)</span> : <span className="text-sm font-normal text-base-content/60">(optional)</span>}
        </span>
        <CaptureButtons pathPrefix="receiving/photos" photosOnly onUploaded={(files) => onChange({ ...line, photos: [...line.photos, ...files] })} fileLabel="Choose photos" />
        {line.photos.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {line.photos.map((p) => (
              <li key={p.fileId} className="badge badge-lg gap-2 py-4">
                <TbPhoto className="size-4" />
                <span className="max-w-48 truncate">{p.name}</span>
                <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onChange({ ...line, photos: line.photos.filter((x) => x.fileId !== p.fileId) })}>
                  <TbX className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default InspectStep
