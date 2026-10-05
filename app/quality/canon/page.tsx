import Link from "next/link"
import { TbSettings } from "react-icons/tb"
import PageTitle from "@/components/Text/PageTitle"
import { canonActions } from "@/actions/canon"
import Dashboard from "./_components/Dashboard"

// always reflect the latest reviews and statuses
export const dynamic = "force-dynamic"

const CanonDashboardPage = async () => {
  const data = await canonActions.artifacts.getDashboard()

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Canon</PageTitle>
        <Link href="/settings/canon" className="btn btn-ghost">
          <TbSettings className="size-5" /> Canon settings
        </Link>
      </div>
      <Dashboard data={data} />
    </div>
  )
}

export default CanonDashboardPage
