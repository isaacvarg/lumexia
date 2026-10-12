import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import { CheckAnswers, failedChecks, unansweredChecks } from "@/lib/receiving/checks"
import { planLine } from "@/lib/receiving/plan"
import type { ReceiveInput } from "@/lib/receiving/receive"
import { sameSupplierLot } from "@/lib/itemDocuments/supplierLots"
import { fromDateInput } from "@/components/ItemDocuments/presentation"
import type { ItemExpectations, WaitingDocument } from "@/lib/receiving/queries"
import type { ReceivingFlag } from "@/lib/receiving/flags"

// Everything the receiver enters before posting. Kept as strings the way inputs hold them.

export type Uploaded = { fileId: string; name: string; mimeType: string }

export type LotDraft = {
  key: string
  supplierLotNumber: string
  quantity: string
  expiresAt: string
  manufacturedAt: string
  // waiting documents the receiver chose to attach or leave off; unset means "attach if the supplier lot matches"
  linkChoices: Record<string, boolean>
}

export type DocumentDraft = Uploaded & {
  key: string
  fileTypeId: string
  // null for an item-level document
  lotKey: string | null
  issuedAt: string
}

export type LineDraft = {
  purchaseOrderItemId: string
  checks: CheckAnswers
  issueNote: string
  photos: Uploaded[]
  lots: LotDraft[]
  documents: DocumentDraft[]
}

export type DeliveryDraft = {
  packingSlipNumber: string
  carrier: string
  notes: string
  packingSlips: Uploaded[]
}

let keySeq = 0
export const newKey = () => `k${++keySeq}`

export const newLot = (quantity: number | null): LotDraft => ({
  key: newKey(),
  supplierLotNumber: "",
  quantity: quantity && quantity > 0 ? String(round(quantity)) : "",
  expiresAt: "",
  manufacturedAt: "",
  linkChoices: {},
})

export const newLine = (item: PurchaseOrderItem): LineDraft => ({
  purchaseOrderItemId: item.id,
  checks: {},
  issueNote: "",
  photos: [],
  lots: [newLot(item.quantity)],
  documents: [],
})

export const round = (n: number) => Math.round(n * 1e6) / 1e6

export const parseQuantity = (v: string) => {
  const n = Number(v.replace(",", "."))
  return Number.isFinite(n) ? n : NaN
}

export const linePlan = (item: PurchaseOrderItem, line: LineDraft) =>
  planLine(item.quantity, line.lots.map((l) => parseQuantity(l.quantity) || 0))

// Waiting documents that go on this lot: those with its supplier lot, unless unticked, plus any ticked by hand.
export const isLinked = (lot: LotDraft, doc: WaitingDocument) =>
  lot.linkChoices[doc.id] ?? (!!lot.supplierLotNumber.trim() && sameSupplierLot(doc.supplierLotNumber, lot.supplierLotNumber))

export const linkedDocuments = (lot: LotDraft, waiting: WaitingDocument[]) => waiting.filter((d) => isLinked(lot, d))

export const inspectionProblem = (line: LineDraft) => {
  if (unansweredChecks(line.checks).length > 0) return "Answer every check."
  if (failedChecks(line.checks).length > 0 && !line.issueNote.trim()) return "Describe what failed."
  return null
}

export const lotsProblem = (line: LineDraft) => {
  if (line.lots.length === 0) return "Add at least one lot."
  if (line.lots.some((l) => !(parseQuantity(l.quantity) > 0))) return "Every lot needs a quantity."
  return null
}

// Warnings shown before posting. None of them stop the receipt.
export const draftFlags = (item: PurchaseOrderItem, line: LineDraft, expectations: ItemExpectations | undefined): { flag: ReceivingFlag; lotKey?: string }[] => {
  const flags: { flag: ReceivingFlag; lotKey?: string }[] = []
  const plan = linePlan(item, line)
  if (failedChecks(line.checks).length > 0) flags.push({ flag: "inspection" })
  if (plan.overReceived) flags.push({ flag: "overReceived" })
  if (plan.remainder > 0) flags.push({ flag: "shortReceived" })
  for (const lot of line.lots) {
    if (!lot.supplierLotNumber.trim()) flags.push({ flag: "noSupplierLot", lotKey: lot.key })
    const missing = lotDocumentStates(lot, line, expectations).some((s) => s.level === "required" && s.state === "missing")
    if (missing) flags.push({ flag: "docsMissing", lotKey: lot.key })
    const linked = linkedDocuments(lot, expectations?.waitingDocuments ?? [])
    if (linked.some((d) => lot.supplierLotNumber.trim() && !sameSupplierLot(d.supplierLotNumber, lot.supplierLotNumber))) {
      flags.push({ flag: "lotMismatch", lotKey: lot.key })
    }
  }
  return flags
}

// For each lot document the item requires, whether this lot will have it: attached from what's on file,
// uploaded now, or missing.
export const lotDocumentStates = (lot: LotDraft, line: LineDraft, expectations: ItemExpectations | undefined) => {
  const linked = linkedDocuments(lot, expectations?.waitingDocuments ?? [])
  return (expectations?.lotRequirements ?? []).map((r) => {
    const onFile = linked.filter((d) => d.fileTypeId === r.fileTypeId)
    const uploaded = line.documents.filter((d) => d.lotKey === lot.key && d.fileTypeId === r.fileTypeId)
    return {
      ...r,
      onFile,
      uploaded,
      state: onFile.length > 0 ? ("onFile" as const) : uploaded.length > 0 ? ("uploaded" as const) : ("missing" as const),
    }
  })
}

export const toReceiveInput = (
  purchaseOrderId: string,
  delivery: DeliveryDraft,
  lines: LineDraft[],
  expectationsFor: (purchaseOrderItemId: string) => ItemExpectations | undefined
): ReceiveInput => ({
  purchaseOrderId,
  packingSlipNumber: delivery.packingSlipNumber || null,
  carrier: delivery.carrier || null,
  notes: delivery.notes || null,
  packingSlipFileIds: delivery.packingSlips.map((f) => f.fileId),
  lines: lines.map((line) => {
    const waiting = expectationsFor(line.purchaseOrderItemId)?.waitingDocuments ?? []
    // a waiting document can only go on one lot; the first lot that claims it wins
    const claimed = new Set<string>()
    return {
      purchaseOrderItemId: line.purchaseOrderItemId,
      checks: line.checks,
      issueNote: line.issueNote || null,
      photoFileIds: line.photos.map((p) => p.fileId),
      lots: line.lots.map((lot) => ({
        supplierLotNumber: lot.supplierLotNumber || null,
        quantity: parseQuantity(lot.quantity),
        expiresAt: fromDateInput(lot.expiresAt),
        manufacturedAt: fromDateInput(lot.manufacturedAt),
        linkDocumentIds: linkedDocuments(lot, waiting)
          .map((d) => d.id)
          .filter((id) => !claimed.has(id) && claimed.add(id)),
      })),
      documents: line.documents
        .filter((d) => d.fileTypeId)
        .map((d) => {
          const lotIndex = d.lotKey ? line.lots.findIndex((l) => l.key === d.lotKey) : -1
          return {
            fileId: d.fileId,
            name: d.name,
            fileTypeId: d.fileTypeId,
            lotIndex: lotIndex >= 0 ? lotIndex : null,
            issuedAt: fromDateInput(d.issuedAt),
            expiresAt: null,
          }
        }),
    }
  }),
})
