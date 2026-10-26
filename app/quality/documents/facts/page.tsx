import Link from "next/link"
import PageTitle from "@/components/Text/PageTitle"
import prisma from "@/lib/prisma"
import { getInboxCounts } from "@/lib/documentInbox/queries"
import { listFactDefinitions } from "@/lib/documentExtractions/catalog"
import { countExtractionsToReview, describeFact, documentsByContent, searchFacts, type ValueFilter } from "@/lib/documentExtractions/queries"
import { claimStatuses, reviewStates } from "@/lib/documentExtractions/types"
import { canonicalUnit } from "@/lib/documentExtractions/units"
import { factText, MethodBadge, pageLabel, reviewStateLabel } from "@/components/DocumentExtractions/presentation"
import { slugify } from "@/utils/slug"
import DocumentsNav from "../_components/DocumentsNav"

export const dynamic = "force-dynamic"

// Facts across every current extraction, e.g. every material with a flash point under 60 °C, every Prop 65
// row for a CAS, or every material whose supplier states it's vegan. A plain GET form, so searches can be linked.

type Params = { item?: string; key?: string; op?: string; value?: string; unit?: string; claim?: string; cas?: string; text?: string; review?: string; check?: string; cursor?: string }

const ops: { op: ValueFilter["op"]; label: string }[] = [
  { op: "lt", label: "less than" },
  { op: "lte", label: "at most" },
  { op: "gt", label: "more than" },
  { op: "gte", label: "at least" },
  { op: "eq", label: "equal to" },
]

const PAGE_SIZE = 100

const FactSearchPage = async ({ searchParams }: { searchParams: Params }) => {
  const [definitions, inbox, extractionCount] = await Promise.all([
    listFactDefinitions(prisma, { includeProposed: true }),
    getInboxCounts(prisma),
    countExtractionsToReview(prisma),
  ])
  const definition = definitions.find((d) => d.key === searchParams.key)
  const numericKey = definition && (definition.unitFamily || (definition.kind === "scalar" && (definition.valueSchema as { type?: string }).type === "number") || (definition.valueSchema as { normalize?: unknown }).normalize)

  const value = searchParams.value?.trim()
  const valueFilter: ValueFilter | undefined = value
    ? numericKey && searchParams.op && searchParams.op !== "contains"
      ? { op: searchParams.op as ValueFilter["op"], value: Number(value), unit: searchParams.unit?.trim() || undefined }
      : undefined
    : undefined
  const text = searchParams.text?.trim()

  // an item by reference code, id or name; several name matches are listed to pick from
  const itemQuery = searchParams.item?.trim()
  const itemMatches = itemQuery
    ? await prisma.item.findMany({
        where: { OR: [{ id: itemQuery }, { referenceCode: { equals: itemQuery, mode: "insensitive" } }, { name: { contains: itemQuery, mode: "insensitive" } }] },
        select: { id: true, name: true, referenceCode: true },
        orderBy: { name: "asc" },
        take: 20,
      })
    : []
  const item = itemMatches.find((i) => i.id === itemQuery || i.referenceCode.toLowerCase() === itemQuery?.toLowerCase()) ?? (itemMatches.length === 1 ? itemMatches[0] : null)
  const itemShas = item
    ? (await prisma.itemFile.findMany({ where: { itemId: item.id, supersededAt: null }, select: { file: { select: { sha256: true } } } }))
        .map((d) => d.file.sha256)
        .filter((s): s is string => !!s)
    : undefined
  const itemPending = !!itemQuery && !item

  const searched = !itemPending && !!(item || searchParams.key || valueFilter || text || searchParams.claim || searchParams.cas || searchParams.review || searchParams.check)

  const result = searched
    ? await searchFacts(prisma, {
        sha256s: itemShas,
        factKey: definition?.key,
        unitFamily: definition?.unitFamily,
        valueFilter: valueFilter ?? (text ? { op: "contains", value: text } : undefined),
        claimStatus: searchParams.claim || undefined,
        cas: searchParams.cas || undefined,
        reviewState: searchParams.review || undefined,
        needsHumanCheck: searchParams.check === "1" ? true : undefined,
        limit: PAGE_SIZE,
        cursor: searchParams.cursor,
      })
    : null
  const facts = result && !("error" in result) ? result.facts : []
  const docsBySha = await documentsByContent(prisma, Array.from(new Set(facts.map((f) => f.extraction.sha256))))
  const nextHref = result && !("error" in result) && result.nextCursor
    ? `?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v)), cursor: result.nextCursor } as Record<string, string>)}`
    : null

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Fact Search</PageTitle>
        <DocumentsNav active="facts" inboxCount={inbox.review} extractionCount={extractionCount} />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Item</span>
          <input name="item" defaultValue={item ? item.referenceCode : itemQuery ?? ""} placeholder="Name or code" className="input input-sm w-44" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Fact</span>
          <select name="key" defaultValue={searchParams.key ?? ""} className="select select-sm w-64">
            <option value="">Any fact</option>
            {definitions.map((d) => <option key={d.key} value={d.key}>{d.label}{d.status === "proposed" ? " (proposed)" : ""}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Number</span>
          <span className="flex gap-1">
            <select name="op" defaultValue={searchParams.op ?? "lt"} className="select select-sm w-28">
              {ops.map((o) => <option key={o.op} value={o.op}>{o.label}</option>)}
            </select>
            <input name="value" type="number" step="any" defaultValue={searchParams.value ?? ""} className="input input-sm w-24" />
            <input name="unit" defaultValue={searchParams.unit ?? ""} placeholder={canonicalUnit(definition?.unitFamily) ?? "unit"} className="input input-sm w-20" />
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Text contains</span>
          <input name="text" defaultValue={text ?? ""} className="input input-sm w-44" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Claim</span>
          <select name="claim" defaultValue={searchParams.claim ?? ""} className="select select-sm w-32">
            <option value="">Any</option>
            {claimStatuses.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Component CAS</span>
          <input name="cas" defaultValue={searchParams.cas ?? ""} placeholder="56-81-5" className="input input-sm w-28" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Review</span>
          <select name="review" defaultValue={searchParams.review ?? ""} className="select select-sm w-36">
            <option value="">Any</option>
            {reviewStates.map((r) => <option key={r} value={r}>{reviewStateLabel[r]}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-1 text-sm">
          <input type="checkbox" name="check" value="1" defaultChecked={searchParams.check === "1"} className="checkbox checkbox-sm" />
          Waiting for a check
        </label>
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
        {searched && <Link href="/quality/documents/facts" className="btn btn-ghost btn-sm">Clear</Link>}
      </form>

      {itemPending && (
        itemMatches.length === 0 ? (
          <p className="text-sm text-warning">No item matches “{itemQuery}”.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-base-content/70">Several items match; pick one:</span>
            {itemMatches.map((i) => (
              <Link key={i.id} href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => v && k !== "cursor")), item: i.referenceCode } as Record<string, string>)}`} className="btn btn-ghost btn-xs">
                {i.name} <span className="text-base-content/50">{i.referenceCode}</span>
              </Link>
            ))}
          </div>
        )
      )}
      {value && !valueFilter && (
        <p className="text-sm text-warning">Number filters need a fact with numeric values (e.g. Flash point). Use “Text contains” for anything else.</p>
      )}
      {result && "error" in result && <p role="alert" className="text-sm text-error">{result.error}</p>}

      {!searched ? (
        <p className="text-base-content/60">Pick a fact or a condition. Numbers compare in the fact&apos;s own unit (°F converts to °C); for ranges, “less than” tests the lower bound and “more than” the upper one.</p>
      ) : facts.length === 0 ? (
        <p className="text-base-content/60">No facts match.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th>Fact</th>
                <th>Value</th>
                <th>Source</th>
                <th>Read</th>
              </tr>
            </thead>
            <tbody>
              {facts.map((raw) => {
                const f = describeFact(raw)
                const docs = (docsBySha.get(raw.extraction.sha256) ?? []).filter((d) => !d.replaced)
                const page = pageLabel(f.page)
                return (
                  <tr key={f.id}>
                    <td className="align-top">
                      {docs.length === 0 ? <span className="text-base-content/50">No current document</span> : docs.map((d) => (
                        <Link key={d.documentId} href={`/inventory/items/${slugify(d.item.name)}?id=${d.item.id}&tab=files&document=${d.documentId}`} className="link block">
                          {d.item.name} <span className="text-xs text-base-content/50">{d.type}{d.supplier && ` · ${d.supplier}`}</span>
                        </Link>
                      ))}
                    </td>
                    <td className="align-top">
                      {f.label}
                      {"component" in f && f.component && <div className="text-xs text-base-content/60">{f.component.name}{f.component.cas && ` · ${f.component.cas}`}</div>}
                    </td>
                    <td className="align-top">{factText(f)}</td>
                    <td className="max-w-md align-top text-xs text-base-content/70">
                      {page && <span className="mr-1">{page}</span>}<q className="italic">{f.quote}</q>
                    </td>
                    <td className="align-top">
                      <div className="flex flex-wrap items-center gap-1">
                        <MethodBadge method={f.method} />
                        {f.verified ? <span className="badge badge-success badge-soft badge-xs">verified</span> : f.needsHumanCheck ? <span className="badge badge-warning badge-soft badge-xs">to check</span> : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {nextHref && <div className="border-t border-base-300 p-3 text-right"><Link href={nextHref} className="btn btn-ghost btn-sm">Next {PAGE_SIZE}</Link></div>}
        </div>
      )}
    </div>
  )
}

export default FactSearchPage
