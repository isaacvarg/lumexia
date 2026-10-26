'use client'
import { useMemo } from "react"
import { TbArrowsDiff, TbZoomQuestion } from "react-icons/tb"
import type { ItemFact } from "@/lib/documentExtractions/queries"
import { factText, MethodBadge, pageLabel } from "./presentation"

// An item's extracted facts grouped by kind of fact, each with the document it came from. Facts are
// unreviewed evidence until someone verifies them. Used in the Files tab summary, beside Canon values, and
// to pick facts to cite when proposing a Canon change (selected + onToggle).

type Props = {
  facts: ItemFact[]
  onOpenDocument?: (documentId: string) => void
  selected?: Set<string>
  onToggle?: (fact: ItemFact) => void
  // facts read after this time are marked new, e.g. since a Canon value was approved
  newSince?: Date | string | null
}

// Single-value facts (not table rows) that different documents state differently.
export const differingKeys = (facts: ItemFact[]) => {
  const values = new Map<string, Set<string>>()
  for (const f of facts) {
    if (f.kind === "row" || f.scope === "component") continue
    const set = values.get(f.key) ?? new Set<string>()
    set.add((f.printed ?? "").trim().toLowerCase())
    values.set(f.key, set)
  }
  return new Set(Array.from(values.entries()).filter(([, v]) => v.size > 1).map(([k]) => k))
}

const ItemFactList = ({ facts, onOpenDocument, selected, onToggle, newSince }: Props) => {
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; facts: ItemFact[] }>()
    for (const f of facts) {
      const g = map.get(f.key) ?? { label: f.label, facts: [] }
      g.facts.push(f)
      map.set(f.key, g)
    }
    return Array.from(map.entries())
  }, [facts])
  const differing = useMemo(() => differingKeys(facts), [facts])
  const since = newSince ? new Date(newSince) : null

  return (
    <div className="flex flex-col divide-y divide-base-300 rounded-lg border border-base-300">
      {groups.map(([key, group]) => (
        <section key={key}>
          <h4 className="flex items-center gap-2 bg-base-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">
            {group.label}
            {differing.has(key) && (
              <span className="badge badge-warning badge-soft badge-xs gap-1 normal-case tracking-normal" title="Documents state different values">
                <TbArrowsDiff className="size-3" /> documents differ
              </span>
            )}
          </h4>
          <ul className="divide-y divide-base-300/60">
            {group.facts.map((f) => {
              const isNew = since && new Date(f.extraction.readAt) > since
              return (
                <li key={f.id} className="flex items-start gap-3 px-3 py-2 text-sm">
                  {onToggle && (
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm mt-0.5"
                      checked={selected?.has(f.id) ?? false}
                      onChange={() => onToggle(f)}
                      aria-label={`Cite ${group.label}: ${factText(f)}`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {"component" in f && f.component && (
                        <span className="font-medium">{f.component.name ?? f.component.cas}{f.component.name && f.component.cas && <span className="font-normal text-base-content/50"> · {f.component.cas}</span>}:</span>
                      )}
                      <span>{factText(f)}</span>
                      <MethodBadge method={f.method} />
                      {f.verified ? (
                        <span className="badge badge-success badge-soft badge-xs">{f.method === "human" ? "entered" : "verified"}</span>
                      ) : f.needsHumanCheck ? (
                        <span className="badge badge-warning badge-soft badge-xs gap-1"><TbZoomQuestion className="size-3" />to check</span>
                      ) : (
                        <span className="badge badge-ghost badge-xs">not verified</span>
                      )}
                      {isNew && <span className="badge badge-info badge-soft badge-xs" title="Read after the current value was approved">new</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-base-content/60">
                      {f.documents.map((d) => (
                        <button
                          key={d.documentId}
                          type="button"
                          className={onOpenDocument ? "link" : "cursor-default"}
                          onClick={() => onOpenDocument?.(d.documentId)}
                          disabled={!onOpenDocument}
                        >
                          {d.type}
                          {d.supplier && ` · ${d.supplier.name}`}
                          {d.lot && ` · lot ${d.lot}`}
                          {d.surrogateFor && ` · via ${d.surrogateFor.name}`}
                        </button>
                      ))}
                      {pageLabel(f.page) && <span>{pageLabel(f.page)}</span>}
                      <q className="italic">{f.quote}</q>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default ItemFactList
