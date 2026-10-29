'use client'

import { useState, useTransition } from "react"
import { approveItemBaseline, confirmImportedResult, rejectImportedResult } from "../_actions"

type Result = { error?: string }

const Buttons = ({ actions }: { actions: { label: string; className: string; run: () => Promise<Result> }[] }) => {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {actions.map((a) => (
          <button key={a.label} type="button" disabled={pending} className={`btn btn-xs ${a.className}`} onClick={() => start(async () => setError((await a.run()).error ?? null))}>
            {a.label}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  )
}

export const BaselineButtons = ({ itemId }: { itemId: string }) => (
  <Buttons actions={[{ label: "Approve baseline", className: "btn-primary", run: () => approveItemBaseline(itemId) }]} />
)

export const ResultButtons = ({ resultId }: { resultId: string }) => (
  <Buttons
    actions={[
      { label: "Confirm", className: "btn-primary", run: () => confirmImportedResult(resultId) },
      { label: "Reject", className: "btn-ghost", run: () => rejectImportedResult(resultId) },
    ]}
  />
)
