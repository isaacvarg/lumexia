import PageTitle from "@/components/Text/PageTitle"
import prisma from "@/lib/prisma"
import { getInboxCounts, listInboxDocuments } from "@/lib/documentInbox/queries"
import { InboxView } from "@/lib/documentInbox/types"
import DocumentsNav from "../_components/DocumentsNav"
import Inbox from "./_components/Inbox"
import { toInboxRows } from "./_rows"

export const dynamic = "force-dynamic"

const views: InboxView[] = ["review", "pending", "agentFiled", "filed", "dismissed"]

const DocumentInboxPage = async ({ searchParams }: { searchParams: { view?: string; doc?: string } }) => {
  const view = views.includes(searchParams.view as InboxView) ? (searchParams.view as InboxView) : "review"

  const [counts, documents, fileTypes, suppliers, accountingFileTypes] = await Promise.all([
    getInboxCounts(prisma),
    listInboxDocuments(prisma, view).then(toInboxRows),
    prisma.itemFileType.findMany({ select: { id: true, name: true, bgColor: true, textColor: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.poAccountingFileType.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ])

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Document Inbox</PageTitle>
        <DocumentsNav active="inbox" inboxCount={counts.review} />
      </div>
      <Inbox
        view={view}
        counts={counts}
        documents={documents}
        initialDocumentId={searchParams.doc}
        options={{ fileTypes, suppliers, accountingFileTypes }}
      />
    </div>
  )
}

export default DocumentInboxPage
