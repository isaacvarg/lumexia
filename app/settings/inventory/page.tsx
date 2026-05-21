import PageBreadcrumbs from "@/components/App/PageBreadcrumbs"
import PageTitle from "@/components/Text/PageTitle"
import { appActions } from "@/actions/app"
import InventoryAuditSettingsForm from "./_components/InventoryAuditSettingsForm"

const InventorySettingsPage = async () => {

  const configs = await appActions.configs.ensureInventoryAuditConfigs()

  return (
    <div className="flex flex-col gap-y-6">
      <PageBreadcrumbs />
      <PageTitle>Inventory Audit Triggers</PageTitle>
      <InventoryAuditSettingsForm configs={configs} />
    </div>
  )
}

export default InventorySettingsPage
