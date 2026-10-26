import Link from "next/link"
import { TbSettings } from "react-icons/tb"
import PageTitle from "@/components/Text/PageTitle"
import prisma from "@/lib/prisma"
import { getDocumentDashboard } from "@/lib/itemDocuments/dashboard"
import { getInboxCounts } from "@/lib/documentInbox/queries"
import { countExtractionsToReview } from "@/lib/documentExtractions/queries"
import Dashboard from "./_components/Dashboard"
import DocumentsNav from "./_components/DocumentsNav"

// always reflect the latest uploads and expiry dates
export const dynamic = "force-dynamic"

const DocumentsDashboardPage = async () => {
  const [data, inbox, extractions] = await Promise.all([getDocumentDashboard(prisma), getInboxCounts(prisma), countExtractionsToReview(prisma)])

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Document Compliance</PageTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/settings/inventory" className="btn btn-ghost btn-sm">
            <TbSettings className="size-5" /> Document requirements
          </Link>
          <DocumentsNav active="compliance" inboxCount={inbox.review} extractionCount={extractions} />
        </div>
      </div>
      <Dashboard data={data} />
    </div>
  )
}

export default DocumentsDashboardPage
