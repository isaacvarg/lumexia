import { useMemo } from "react"
import type { DocumentDashboard, DocumentIssue } from "@/lib/itemDocuments/dashboard"
import { RequirementStatus } from "@/lib/itemDocuments/types"
import { slugify } from "@/utils/slug"

export type IssueRow = DocumentIssue & {
  item: DocumentDashboard["items"][number] | undefined
  fileType: DocumentDashboard["fileTypes"][number] | undefined
  supplier: DocumentDashboard["suppliers"][number] | undefined
  lotNumber: string | null
  documentName: string | null
  href: string
}

// worst first
export const severity: Record<RequirementStatus, number> = {
  missing: 0,
  expired: 1,
  stale: 2,
  undated: 3,
  expiring: 4,
  current: 5,
  notApplicable: 6,
}

// Joins each issue with the names it refers to, sorted by severity then item.
export const useIssueRows = (data: DocumentDashboard): IssueRow[] =>
  useMemo(() => {
    const items = new Map(data.items.map((i) => [i.id, i]))
    const fileTypes = new Map(data.fileTypes.map((t) => [t.id, t]))
    const suppliers = new Map(data.suppliers.map((s) => [s.id, s]))
    const lots = new Map(data.lots.map((l) => [l.id, l.lotNumber]))
    const documents = new Map(data.documents.map((d) => [d.id, d.name]))

    return data.issues
      .map((issue) => {
        const item = items.get(issue.itemId)
        return {
          ...issue,
          item,
          fileType: fileTypes.get(issue.fileTypeId),
          supplier: issue.supplierId ? suppliers.get(issue.supplierId) : undefined,
          lotNumber: issue.lotId ? lots.get(issue.lotId) ?? null : null,
          documentName: issue.documentId ? documents.get(issue.documentId) ?? null : null,
          href: `/inventory/items/${slugify(item?.name ?? "item")}?id=${issue.itemId}&tab=files`,
        }
      })
      .sort((a, b) => severity[a.status] - severity[b.status] || (a.item?.name ?? "").localeCompare(b.item?.name ?? ""))
  }, [data])
