import Card from "@/components/Card"
import { useItemSelection } from "@/store/itemSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";

const InventoryAmounts = () => {

  const { inventory } = useItemSelection();

  if (!inventory) return false

  return (
    <div className="col-span-3 grid grid-cols-2 gap-6">
      <Card.Root>
        <Card.Title>On Hand</Card.Title>
        <AmountData amount={inventory.totalQuantityOnHand} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <Card.Root>
        <Card.Title>Allocated</Card.Title>
        <AmountData amount={inventory.totalQuantityAllocated} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <Card.Root>
        <Card.Title>On Order</Card.Title>
        <AmountData amount={inventory.totalQuantityOnOrder} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <Card.Root>
        <Card.Title>Available</Card.Title>
        <AmountData amount={inventory.totalQuantityAvailable} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>


    </div>
  )
}

const AmountData = ({ amount, uomAbbreviation }: { amount: number, uomAbbreviation: string }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex gap-x-2 items-end">      <h1
        className="font-poppins text-4xl font-semibold text-base-content"
      >{toFracitonalDigits.weight(amount)}</h1>
        <p className="font-poppins text-base-content/50 text-lg font-semibold">{uomAbbreviation}</p>
      </div>

    </div>
  )
}

export default InventoryAmounts
