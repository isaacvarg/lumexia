import Link from "next/link"
import { TbSettings } from "react-icons/tb"
import PageTitle from "@/components/Text/PageTitle"
import prisma from "@/lib/prisma"
import { getInboxCounts } from "@/lib/documentInbox/queries"
import { getCrossChecks, getExtractionReviewQueue } from "@/lib/documentExtractions/queries"
import DocumentsNav from "../_components/DocumentsNav"
import ReviewQueue from "./_components/ReviewQueue"

export const dynamic = "force-dynamic"

const ExtractionReviewPage = async () => {
  const [queue, inbox, crossChecks] = await Promise.all([getExtractionReviewQueue(prisma), getInboxCounts(prisma), getCrossChecks(prisma)])

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Extraction Review</PageTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/settings/inventory?tab=documents" className="btn btn-ghost btn-sm">
            <TbSettings className="size-5" /> Fact catalog
          </Link>
          <DocumentsNav active="extractions" inboxCount={inbox.review} extractionCount={queue.toCheck.length} />
        </div>
      </div>
      <ReviewQueue queue={queue} crossChecks={crossChecks} />
    </div>
  )
}

export default ExtractionReviewPage
