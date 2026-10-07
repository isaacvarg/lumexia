import Card from "@/components/Card"
import LabelDataPair from "@/components/Text/LabelDataPair"
import { useItemSelection } from "@/store/itemSlice"
import PanelSkeleton from "../shared/PanelSkeleton"
import Layout from "@/components/Layout"
import { TbEdit } from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import EditItemDialog from "./EditItemDialog"
import SoldHint from "./SoldHint"

const ItemProperties = () => {
  const { item } = useItemSelection()
  const { showDialog } = useDialog()

  if (!item) return <PanelSkeleton />

  return (
    <Card.Root>

      <EditItemDialog />

      <Layout.Row>
        <Card.Title>Item Properties</Card.Title>
        <button onClick={() => showDialog('editItemProperties')} className="btn btn-primary btn-outline btn-circle">
          <TbEdit className="text-xl" />
        </button>
      </Layout.Row>

      <LabelDataPair label="Name" data={item.name} />
      <LabelDataPair label="Reference Code" data={item.referenceCode} />
      <LabelDataPair label="Item Type" data={item.itemType.name} />
      <LabelDataPair
        label="Procurement Type"
        data={item.procurementType.name}
      />
      <LabelDataPair label="Inventory Type" data={item.inventoryType.name} textCase="capitalize" />

      <LabelDataPair label="Inventory UOM" data={item.inventoryUom.name} textCase="capitalize" />
      <LabelDataPair label="Sold to customers" data={item.isSold ? "Yes" : "No"} />

      <SoldHint />

    </Card.Root>
  )
}



export default ItemProperties
