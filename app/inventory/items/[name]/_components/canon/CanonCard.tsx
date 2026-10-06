'use client'
import { useState } from "react"
import { TbCheck, TbCopy, TbHistory, TbLink, TbPencil, TbShieldCheck } from "react-icons/tb"
import type { CanonEntry } from "@/lib/canon/queries"
import { getShapeKey, toCopyText } from "@/lib/canon/shapes"
import ContentView from "./ContentView"
import StatusBadge from "./StatusBadge"

export type CanonAction = "propose" | "confirm" | "accept" | "history"

type Props = {
  entry: CanonEntry
  onAction: (action: CanonAction) => void
  // extra content at the bottom of the card, e.g. supplier statements
  children?: React.ReactNode
}

const CanonCard = ({ entry, onAction, children }: Props) => {
  const { dataType, artifact, live, canEdit, canReview, hasEditors, hasReviewers } = entry
  const [copied, setCopied] = useState(false)

  const shapeKey = getShapeKey(dataType.shapeId)
  const isLinked = !!dataType.resolverKey
  const accepted = artifact?.currentVersion?.content ?? null
  const pendingReviews = artifact?._count.changeRequests ?? 0
  const awaitingAcceptance = isLinked && !!live && (!artifact?.currentVersion || !!artifact?.hasUnreviewedChange)

  // why there's no button: nobody has the capability yet, or this user doesn't
  const blocker = !isLinked && !canEdit
    ? hasEditors
      ? "Only this type's editors can add or change its value."
      : "Nobody can edit this yet. Add editors in Settings → Canon."
    : awaitingAcceptance && !canReview
      ? hasReviewers
        ? "Waiting for a reviewer to accept the source value."
        : "Nobody can accept the source value yet. Add reviewers in Settings → Canon."
      : null

  const copy = async () => {
    if (accepted === null) return
    await navigator.clipboard.writeText(toCopyText(shapeKey, accepted))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="card border border-base-300 bg-base-100">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold">{dataType.name}</h3>
              {isLinked && (
                <span className="tooltip" data-tip="Linked to Lumexia data">
                  <TbLink className="size-4 text-base-content/50" />
                </span>
              )}
            </div>
            <p className="text-xs text-base-content/60">
              {dataType.shape.name}
              {artifact?.currentVersion && ` · v${artifact.currentVersion.versionNumber}`}
            </p>
          </div>
          <StatusBadge statusId={artifact?.statusId ?? null} />
        </div>

        <div className="min-h-12">
          {accepted !== null ? (
            <ContentView shapeKey={shapeKey} content={accepted} />
          ) : isLinked && live ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm italic text-base-content/60">Not accepted yet. Current source value:</p>
              <div className="opacity-70"><ContentView shapeKey={shapeKey} content={live} /></div>
            </div>
          ) : (
            <p className="text-sm italic text-base-content/50">
              {isLinked ? "There's no source value for this item." : "No value yet."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {accepted !== null && (
            <button onClick={copy} className="btn btn-sm btn-soft">
              {copied ? <TbCheck className="size-4" /> : <TbCopy className="size-4" />} {copied ? "Copied" : "Copy"}
            </button>
          )}

          {!isLinked && canEdit && (
            <button onClick={() => onAction("propose")} className="btn btn-sm btn-soft btn-primary">
              <TbPencil className="size-4" /> {accepted === null ? "Add value" : "Propose change"}
            </button>
          )}

          {artifact?.isStale && (canEdit || canReview) && (
            <button onClick={() => onAction("confirm")} className="btn btn-sm btn-soft btn-warning">
              <TbShieldCheck className="size-4" /> Confirm still valid
            </button>
          )}

          {awaitingAcceptance && canReview && (
            <button onClick={() => onAction("accept")} className="btn btn-sm btn-soft btn-warning">
              <TbShieldCheck className="size-4" /> {artifact?.currentVersion ? "Review source change" : "Accept source"}
            </button>
          )}

          {artifact && (
            <button onClick={() => onAction("history")} className="btn btn-sm btn-ghost ml-auto">
              <TbHistory className="size-4" /> History
              {pendingReviews > 0 && <span className="badge badge-sm badge-warning">{pendingReviews} pending</span>}
            </button>
          )}
        </div>

        {blocker && <p className="text-xs text-base-content/50">{blocker}</p>}

        {children}
      </div>
    </div>
  )
}

export default CanonCard
