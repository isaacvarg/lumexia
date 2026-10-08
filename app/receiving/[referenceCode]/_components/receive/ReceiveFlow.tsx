'use client'
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { TbArrowLeft, TbArrowRight, TbCircleCheck, TbPrinter, TbX } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import type { ItemExpectations, ReceivingFileType } from "@/lib/receiving/queries"
import { receiveDelivery } from "../../_actions/receiveDelivery"
import LabelForm from "../LabelForm"
import DeliveryStep from "./DeliveryStep"
import InspectStep from "./InspectStep"
import LotsStep from "./LotsStep"
import DocumentsStep from "./DocumentsStep"
import ReviewStep from "./ReviewStep"
import { DeliveryDraft, inspectionProblem, LineDraft, lotsProblem, newLine, toReceiveInput } from "./draft"

type Step = { kind: "delivery" } | { kind: "inspect" | "lots" | "documents"; line: number } | { kind: "review" }

const stepTitles = { delivery: "Delivery", inspect: "Inspect", lots: "Supplier lots", documents: "Documents", review: "Review" } as const

type Props = {
  purchaseOrder: { id: string; referenceCode: number; supplierName: string }
  items: PurchaseOrderItem[]
  // every line on the PO, refreshed after posting, to print labels for the new lots
  allItems: PurchaseOrderItem[]
  expectations: ItemExpectations[]
  fileTypes: ReceivingFileType[]
  onClose: () => void
}

const emptyDelivery: DeliveryDraft = { packingSlipNumber: "", carrier: "", notes: "", packingSlips: [] }

const ReceiveFlow = ({ purchaseOrder, items, allItems, expectations, fileTypes, onClose }: Props) => {
  const router = useRouter()
  const [delivery, setDelivery] = useState<DeliveryDraft>(emptyDelivery)
  const [lines, setLines] = useState<LineDraft[]>(() => items.map(newLine))
  const [stepIndex, setStepIndex] = useState(0)
  const [problem, setProblem] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<{ lotIds: string[] } | null>(null)
  const [printing, setPrinting] = useState(false)
  // after "Edit" from the review, Next goes straight back to it
  const [returnToReview, setReturnToReview] = useState(false)
  const body = useRef<HTMLDivElement>(null)

  const steps = useMemo<Step[]>(
    () => [
      { kind: "delivery" },
      ...lines.flatMap((_, line): Step[] => [{ kind: "inspect", line }, { kind: "lots", line }, { kind: "documents", line }]),
      { kind: "review" },
    ],
    [lines]
  )
  const step = steps[stepIndex]
  const itemFor = (line: LineDraft) => items.find((i) => i.id === line.purchaseOrderItemId)!
  const expectationsFor = (item: PurchaseOrderItem) => expectations.find((e) => e.itemId === item.itemId)
  const setLine = (index: number, line: LineDraft) => {
    setProblem(null)
    setLines((prev) => prev.map((l, i) => (i === index ? line : l)))
  }

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [])

  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
    setProblem(null)
  }, [stepIndex])

  const close = () => {
    if (!done && !window.confirm("Leave without receiving? What you entered will be lost.")) return
    onClose()
  }

  const goTo = (index: number) => setStepIndex(Math.max(0, Math.min(index, steps.length - 1)))

  const next = () => {
    if (step.kind === "inspect" || step.kind === "lots") {
      const issue = step.kind === "inspect" ? inspectionProblem(lines[step.line]) : lotsProblem(lines[step.line])
      if (issue) {
        setProblem(issue)
        return
      }
    }
    if (returnToReview) {
      setReturnToReview(false)
      goTo(steps.length - 1)
      return
    }
    goTo(stepIndex + 1)
  }

  const edit = (line: number, kind: "inspect" | "lots" | "documents") => {
    setReturnToReview(true)
    goTo(steps.findIndex((s) => s.kind === kind && "line" in s && s.line === line))
  }

  const submit = async () => {
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]
      const issue = inspectionProblem(line) ?? lotsProblem(line)
      if (issue) {
        setProblem(`${itemFor(line).item.name}: ${issue}`)
        goTo(steps.findIndex((s) => "line" in s && s.line === index))
        return
      }
    }
    setSaving(true)
    setProblem(null)
    try {
      const result = await receiveDelivery(
        toReceiveInput(purchaseOrder.id, delivery, lines, (id) => expectationsFor(items.find((i) => i.id === id)!))
      )
      if (!result.ok) {
        setProblem(result.error)
        return
      }
      setDone({ lotIds: result.lotIds })
      router.refresh()
    } catch {
      setProblem("Couldn't receive. Check the connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const lineHeader = "line" in step ? itemFor(lines[step.line]) : null
  const receivedRows = done ? allItems.filter((i) => i.lot && done.lotIds.includes(i.lot.id)) : []

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base-100" role="dialog" aria-modal aria-label="Receive delivery">
      <header className="flex items-center gap-3 border-b border-base-300 px-4 py-3 md:px-6">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-base-content/60">
            PO #{purchaseOrder.referenceCode} · {purchaseOrder.supplierName}
          </div>
          <div className="truncate text-xl font-semibold">
            {done
              ? "Received"
              : lineHeader
                ? `${lineHeader.alias?.alias?.name ?? lineHeader.item.name} · ${stepTitles[step.kind]}`
                : stepTitles[step.kind]}
          </div>
        </div>
        {!done && lines.length > 1 && "line" in step && (
          <span className="badge badge-lg badge-ghost">Item {step.line + 1} of {lines.length}</span>
        )}
        <button type="button" className="btn btn-ghost btn-lg btn-square" aria-label="Close" onClick={close}>
          <TbX className="size-7" />
        </button>
      </header>

      {!done && (
        <progress className="progress progress-primary h-1.5 w-full rounded-none" value={stepIndex + 1} max={steps.length} />
      )}

      <div ref={body} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
          {done ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 rounded-box bg-success/10 p-5 text-lg">
                <TbCircleCheck className="size-8 text-success" />
                <span>
                  {done.lotIds.length === 1 ? "1 lot was" : `${done.lotIds.length} lots were`} received. Print and apply a label to every container.
                </span>
              </div>
              {printing ? (
                receivedRows.length > 0 ? (
                  <LabelForm items={receivedRows} onComplete={() => setPrinting(false)} />
                ) : (
                  <span className="loading loading-spinner" />
                )
              ) : (
                <button type="button" className="btn btn-lg btn-primary self-start" onClick={() => setPrinting(true)}>
                  <TbPrinter className="size-6" /> Print labels
                </button>
              )}
            </div>
          ) : step.kind === "delivery" ? (
            <DeliveryStep delivery={delivery} items={items} onChange={setDelivery} />
          ) : step.kind === "inspect" ? (
            <InspectStep line={lines[step.line]} onChange={(l) => setLine(step.line, l)} />
          ) : step.kind === "lots" ? (
            <LotsStep
              item={itemFor(lines[step.line])}
              line={lines[step.line]}
              expectations={expectationsFor(itemFor(lines[step.line]))}
              fileTypes={fileTypes}
              onChange={(l) => setLine(step.line, l)}
            />
          ) : step.kind === "documents" ? (
            <DocumentsStep
              item={itemFor(lines[step.line])}
              line={lines[step.line]}
              expectations={expectationsFor(itemFor(lines[step.line]))}
              fileTypes={fileTypes}
              onChange={(l) => setLine(step.line, l)}
            />
          ) : (
            <ReviewStep delivery={delivery} items={items} lines={lines} expectationsFor={expectationsFor} fileTypes={fileTypes} onEdit={edit} />
          )}
        </div>
      </div>

      <footer className="border-t border-base-300 bg-base-100 px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
          {done ? (
            <button type="button" className="btn btn-lg btn-primary ml-auto" onClick={onClose}>Done</button>
          ) : (
            <>
              <button type="button" className="btn btn-lg btn-ghost" disabled={stepIndex === 0 || saving} onClick={() => goTo(stepIndex - 1)}>
                <TbArrowLeft className="size-6" /> Back
              </button>
              <div className="min-w-0 flex-1 text-right">
                {problem && <span role="alert" className="text-error">{problem}</span>}
              </div>
              {step.kind === "review" ? (
                <button type="button" className="btn btn-lg btn-success" disabled={saving} onClick={submit}>
                  {saving && <span className="loading loading-spinner" />}
                  Receive {lines.length === 1 ? "item" : `${lines.length} items`}
                </button>
              ) : (
                <button type="button" className="btn btn-lg btn-primary" onClick={next}>
                  {returnToReview ? "Back to review" : "Next"} <TbArrowRight className="size-6" />
                </button>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  )
}

export default ReceiveFlow
