'use client'

import Card from "@/components/Card/Root"
import Text from "@/components/Text"
import { useInvestigationSelection } from "@/store/investigationSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"

const Summary = () => {

  const { item, lots } = useInvestigationSelection()

  if (!item) return null

  const totalOnHand = lots.reduce((acc, lot) => acc + lot.totalQuantityOnHand, 0)
  const totalLots = lots.length
  const activeLots = lots.filter(l => !l.isDepleted).length
  const depletedLots = lots.filter(l => l.isDepleted).length

  return (
    <Card>
      <Text.SectionTitle>Item Summary</Text.SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
        <Text.LabelDataPair label="Name" data={item.name} />
        <Text.LabelDataPair label="Reference Code" data={item.referenceCode} />
        <Text.LabelDataPair label="Item Type" data={item.itemType.name} />
        <Text.LabelDataPair label="Inventory UOM" data={item.inventoryUom.name} />
        <Text.LabelDataPair label="Procurement Type" data={item.procurementType.name} />
        <Text.LabelDataPair label="Inventory Type" data={item.inventoryType.name} />
        <Text.LabelDataPair label="Total On Hand" data={`${toFracitonalDigits.weight(totalOnHand)} ${item.inventoryUom.abbreviation}`} />
        <Text.LabelDataPair label="Total Lots" data={totalLots} />
        <Text.LabelDataPair label="Active Lots" data={activeLots} />
        <Text.LabelDataPair label="Depleted Lots" data={depletedLots} />
      </div>
    </Card>
  )
}

export default Summary
