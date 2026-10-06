import Link from "next/link"
import { TbSettings } from "react-icons/tb"
import PageTitle from "@/components/Text/PageTitle"
import prisma from "@/lib/prisma"
import { getDocumentDashboard } from "@/lib/itemDocuments/dashboard"
import Dashboard from "./_components/Dashboard"

// always reflect the latest uploads and expiry dates
export const dynamic = "force-dynamic"

const DocumentsDashboardPage = async () => {
  const data = await getDocumentDashboard(prisma)

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Document Compliance</PageTitle>
        <Link href="/settings/inventory" className="btn btn-ghost">
          <TbSettings className="size-5" /> Document requirements
        </Link>
      </div>
      <Dashboard data={data} />
    </div>
  )
}

export default DocumentsDashboardPage
