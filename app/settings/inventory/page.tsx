import PageTitle from "@/components/Text/PageTitle"
import { appActions } from "@/actions/app"
import itemTypeActions from "@/actions/inventory/itemTypeActions"
import InventoryAuditSettingsForm from "./_components/InventoryAuditSettingsForm"

const InventorySettingsPage = async () => {

  const configs = await appActions.configs.ensureInventoryAuditConfigs()
  const itemTypes = await itemTypeActions.getAll()

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Inventory Audit Triggers</PageTitle>
      <InventoryAuditSettingsForm configs={configs} itemTypes={itemTypes} />
    </div>
  )
}

export default InventorySettingsPage
