import PageTitle from '@/components/Text/PageTitle'
import { facilityActions } from '@/actions/facility'
import { productionActions } from '@/actions/production'
import userRoleActions from '@/actions/users/userRoles'
import EquipmentTable from './_components/EquipmentTable'
import CompoundingVessels from './_components/CompoundingVessels'
import ActionableTypesTable from './_components/ActionableTypesTable'
import { getActionableTypes } from './_actions/getActionableTypes'
import TabSelector from './_components/shared/TabSelector'
import TabsContainer from './_components/shared/TabsContainer'
import ProductionSettingsHelper from './_components/shared/ProductionSettingsHelper'

const ProductionSettingsPage = async () => {

  const [equipment, equipmentTypes, compoundingVessels, actionableTypes, userRoles] = await Promise.all([
    facilityActions.equipment.getAll(),
    facilityActions.equipmentTypes.getAll(),
    productionActions.compoundingVessels.getAll(),
    getActionableTypes(),
    userRoleActions.getAll(),
  ])

  return (
    <div className="flex flex-col gap-y-6">
      <ProductionSettingsHelper />

      <PageTitle>Production Settings</PageTitle>

      <TabSelector />
      <TabsContainer
        equipment={<EquipmentTable equipment={equipment} equipmentTypes={equipmentTypes} />}
        vessels={<CompoundingVessels vessels={compoundingVessels} equipment={equipment} />}
        actionables={<ActionableTypesTable actionableTypes={actionableTypes} userRoles={userRoles} />}
      />
    </div>
  )
}

export default ProductionSettingsPage
