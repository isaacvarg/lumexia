import PageTitle from "@/components/Text/PageTitle"
import { appActions } from "@/actions/app"
import itemTypeActions from "@/actions/inventory/itemTypeActions"
import inventoryTypeActions from "@/actions/inventory/inventoryTypeActions"
import aliasTypeActions from "@/actions/inventory/aliasTypes"
import { getAllItemTypes } from "@/actions/inventory/itemTypes/getAll"
import { getItemFileTypes } from "@/app/inventory/items/[name]/_actions/files/getItemFilesTypes"
import InventoryAuditSettingsForm from "./_components/InventoryAuditSettingsForm"
import InventoryConfiguration from "./_components/InventoryConfiguration"
import TabSelector from "./_components/shared/TabSelector"
import TabsContainer from "./_components/shared/TabsContainer"

const InventorySettingsPage = async () => {

  const [configs, itemTypes, inventoryTypes, itemTypesWithConfig, aliasTypes, fileTypes] = await Promise.all([
    appActions.configs.ensureInventoryAuditConfigs(),
    itemTypeActions.getAll(),
    inventoryTypeActions.getAll(),
    getAllItemTypes(),
    aliasTypeActions.getAll(),
    getItemFileTypes(),
  ])

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Inventory Settings</PageTitle>

      <TabSelector />
      <TabsContainer
        triggers={<InventoryAuditSettingsForm configs={configs} itemTypes={itemTypes} />}
        configuration={
          <InventoryConfiguration
            inventoryTypes={inventoryTypes}
            itemTypes={itemTypesWithConfig}
            aliasTypes={aliasTypes}
            fileTypes={fileTypes}
          />
        }
      />
    </div>
  )
}

export default InventorySettingsPage
