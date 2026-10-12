'use client'
import { Fragment, useEffect, useRef } from "react"
import { TbCheck, TbChevronRight, TbClipboardList, TbTruckDelivery } from "react-icons/tb"
import type { PurchaseOrderItem } from "@/actions/purchasing/purchaseOrders/items/getAll"
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"

// Makes it obvious what a screen of the receiving flow applies to: the whole delivery, or one item in it.
// Each item keeps the same color in the step tracker and its banner so the receiver can tell them apart.

export type ItemStepKind = "inspect" | "lots" | "documents"
export type Step = { kind: "delivery" } | { kind: ItemStepKind; line: number } | { kind: "review" }

export const itemStepTitles: Record<ItemStepKind, string> = {
  inspect: "Inspect",
  lots: "Supplier lots",
  documents: "Documents",
}
const itemStepOrder: ItemStepKind[] = ["inspect", "lots", "documents"]

// literal class names so Tailwind keeps them
const itemColors = [
  {
    ring: "border-primary",
    edge: "border-l-primary",
    soft: "bg-primary/10",
    solid: "bg-primary text-primary-content",
    text: "text-primary",
  },
  {
    ring: "border-accent",
    edge: "border-l-accent",
    soft: "bg-accent/10",
    solid: "bg-accent text-accent-content",
    text: "text-accent",
  },
  {
    ring: "border-info",
    edge: "border-l-info",
    soft: "bg-info/10",
    solid: "bg-info text-info-content",
    text: "text-info",
  },
  {
    ring: "border-secondary",
    edge: "border-l-secondary",
    soft: "bg-secondary/10",
    solid: "bg-secondary text-secondary-content",
    text: "text-secondary",
  },
]
export const itemColor = (index: number) => itemColors[index % itemColors.length]

export const displayName = (item: PurchaseOrderItem) => item.alias?.alias?.name ?? item.item.name

type NavProps = {
  steps: Step[]
  current: number
  // furthest step reached; anything up to it can be jumped to
  reached: number
  items: PurchaseOrderItem[]
  onGo: (index: number) => void
}

// Delivery → one group per item (inspect, supplier lots, documents) → Review.
export const StepTracker = ({ steps, current, reached, items, onGo }: NavProps) => {
  const indexOf = (match: (s: Step) => boolean) => steps.findIndex(match)
  const stateOf = (index: number) => (index === current ? "current" : index < current || index <= reached ? "done" : "upcoming")
  const canGo = (index: number) => index !== current && index <= reached
  const active = useRef<HTMLDivElement>(null)

  // keep the current step visible when the tracker is wider than the screen
  useEffect(() => {
    active.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    })
  }, [current])

  const wholeStep = (kind: "delivery" | "review", label: string, Icon: typeof TbTruckDelivery) => {
    const index = indexOf((s) => s.kind === kind)
    const state = stateOf(index)
    return (
      <div ref={state === "current" ? active : undefined} className="shrink-0">
        <button
          type="button"
          disabled={!canGo(index)}
          onClick={() => onGo(index)}
          className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium ${state === "current" ? "border-base-content bg-base-content text-base-100" : "border-base-300"} ${state === "upcoming" ? "opacity-50" : ""}`}
        >
          <Icon className="size-4" /> {label}
        </button>
      </div>
    )
  }

  return (
    <nav aria-label="Receiving steps" className="flex items-center gap-2 overflow-x-auto px-4 py-3 md:px-6">
      {wholeStep("delivery", "Delivery", TbTruckDelivery)}
      {items.map((item, line) => {
        const color = itemColor(line)
        const activeItem = "line" in steps[current] && steps[current].line === line
        const firstStep = indexOf((s) => s.kind === "inspect" && "line" in s && s.line === line)
        const finished = current > indexOf((s) => s.kind === "documents" && "line" in s && s.line === line)
        return (
          <Fragment key={item.id}>
            <TbChevronRight className="size-4 shrink-0 text-base-content/30" />
            <div
              ref={activeItem ? active : undefined}
              className={`flex shrink-0 items-center gap-1 rounded-full border-2 py-1 pl-1 pr-2 ${activeItem ? `${color.ring} ${color.soft}` : "border-base-300"}`}
            >
              {/* other items collapse to their number and name; the item being worked on shows its steps */}
              <button type="button" disabled={activeItem || !canGo(firstStep)} onClick={() => onGo(firstStep)} className="flex items-center gap-1">
                <span className={`flex size-7 items-center justify-center rounded-full text-sm font-bold ${color.solid}`}>
                  {finished ? <TbCheck className="size-4" /> : line + 1}
                </span>
                <span className={`truncate text-sm font-semibold ${activeItem ? "max-w-48" : "max-w-28 text-base-content/70"}`} title={displayName(item)}>
                  {displayName(item)}
                </span>
              </button>
              {activeItem &&
                itemStepOrder.map((kind) => {
                  const index = indexOf((s) => s.kind === kind && "line" in s && s.line === line)
                  const state = stateOf(index)
                  return (
                    <button
                      key={kind}
                      type="button"
                      disabled={!canGo(index)}
                      onClick={() => onGo(index)}
                      title={itemStepTitles[kind]}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${state === "current" ? color.solid : state === "done" ? "text-base-content/70" : "text-base-content/40"}`}
                    >
                      {state === "done" && <TbCheck className="size-3" />}
                      {itemStepTitles[kind]}
                    </button>
                  )
                })}
            </div>
          </Fragment>
        )
      })}
      <TbChevronRight className="size-4 shrink-0 text-base-content/30" />
      {wholeStep("review", "Review", TbClipboardList)}
    </nav>
  )
}

type BannerProps = {
  item: PurchaseOrderItem
  line: number
  lineCount: number
  kind: ItemStepKind
}

const scopeText: Record<ItemStepKind, string> = {
  inspect: "Check only this item's containers. Each item in the delivery is inspected separately.",
  lots: "Record the supplier lots for this item only.",
  documents: "Paperwork for this item only (its COA, SDS…).",
}

// Which item this screen is about, and that it applies to that item alone.
export const ItemBanner = ({ item, line, lineCount, kind }: BannerProps) => {
  const color = itemColor(line)
  const name = displayName(item)
  const stepNumber = itemStepOrder.indexOf(kind) + 1
  return (
    <div className={`mb-6 flex flex-col gap-2 rounded-box border-l-8 p-4 ${color.edge} ${color.soft}`}>
      <div className={`text-sm font-semibold uppercase tracking-wide ${color.text}`}>
        Item {line + 1} of {lineCount} · Step {stepNumber} of 3: {itemStepTitles[kind]}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-2xl font-bold">{name}</h2>
        <span className="text-lg">
          Expected{" "}
          <span className="font-semibold">
            {toFracitonalDigits.weight(item.quantity)} {item.uom.abbreviation}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/70">
        {name !== item.item.name && <span>Our name: {item.item.name}</span>}
        <span className="font-mono">{item.item.referenceCode}</span>
        {item.purchaseOrderStatusId === purchaseOrderStatuses.partiallyReceived && <span>Rest of an earlier delivery</span>}
      </div>
      <p className="text-base-content/80">{scopeText[kind]}</p>
    </div>
  )
}

// For the delivery and review screens, which cover every item at once.
export const WholeDeliveryBanner = ({ kind, items }: { kind: "delivery" | "review"; items: PurchaseOrderItem[] }) => (
  <div className="mb-6 flex flex-col gap-2 rounded-box border-l-8 border-base-content/40 bg-base-200/60 p-4">
    <div className="text-sm font-semibold uppercase tracking-wide text-base-content/60">{kind === "delivery" ? "Whole delivery" : "Review everything"}</div>
    <p className="text-base-content/80">
      {kind === "delivery"
        ? items.length === 1
          ? "This applies to the whole delivery. Next, the item gets its own inspection, supplier lots and documents."
          : `This applies to the whole delivery. Next, each of the ${items.length} items gets its own inspection, supplier lots and documents, one item at a time.`
        : "Check every item once more before receiving. Warnings don't stop the receipt; they stay on the lots until they're sorted out."}
    </p>
    {kind === "delivery" && (
      <ul className="flex flex-col gap-1">
        {items.map((item, line) => (
          <li key={item.id} className="flex items-center justify-between gap-3 text-lg">
            <span className="flex min-w-0 items-center gap-2">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${itemColor(line).solid}`}>{line + 1}</span>
              <span className="truncate">{displayName(item)}</span>
            </span>
            <span className="shrink-0 text-base-content/60">
              {toFracitonalDigits.weight(item.quantity)} {item.uom.abbreviation}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
)

// What "Next" leads to, so the receiver knows when they're moving on to another item.
export const nextLabel = (steps: Step[], current: number, items: PurchaseOrderItem[]) => {
  const next = steps[current + 1]
  if (!next) return "Next"
  if (next.kind === "review") return "Next: Review"
  if (next.kind === "delivery") return "Next"
  const item = items[next.line]
  if (next.kind === "inspect") return `Next: Item ${next.line + 1} · ${item ? displayName(item) : ""}`
  return `Next: ${itemStepTitles[next.kind]}`
}
