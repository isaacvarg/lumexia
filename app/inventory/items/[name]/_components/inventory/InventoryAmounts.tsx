import Card from "@/components/Card"
import { useItemSelection } from "@/store/itemSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits";
import { LuInfo } from "react-icons/lu";
import useDialog from "@/hooks/useDialog";
import OnOrderDialog, { onOrderDialog } from "./OnOrderDialog";

const InventoryAmounts = () => {

  const { inventory } = useItemSelection();
  const { showDialog } = useDialog();

  if (!inventory) return false

  return (
    <div className="col-span-3 grid grid-cols-2 gap-6">
      <Card.Root>
        <div className="flex justify-between items-center">
          <Card.Title>On Hand</Card.Title>
          <div className="tooltip" data-tip="Physical quantity currently in stock across all lots of this item.">
            <button className="btn btn-ghost">
              <LuInfo />
            </button>
          </div>
        </div>

        <AmountData amount={inventory.totalQuantityOnHand} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <div onClick={() => showDialog(onOrderDialog)} className="cursor-pointer hover:opacity-90 transition-opacity">
        <Card.Root>
          <div className="flex justify-between items-center">
            <Card.Title>On Order</Card.Title>
            <div className="tooltip" data-tip="Quantity from open purchase orders that has not yet been received. Click to see contributing purchase orders.">
              <button className="btn btn-ghost" onClick={(e) => e.stopPropagation()}>
                <LuInfo />
              </button>
            </div>
          </div>
          <AmountData amount={inventory.totalQuantityOnOrder} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
        </Card.Root>
      </div>

      <Card.Root>
        <div className="flex justify-between items-center">
          <Card.Title>Allocated</Card.Title>
          <div className="tooltip" data-tip="Quantity committed to confirmed BPRs (queued, staging, compounding, awaiting materials, or completed) that have not yet consumed their materials.">
            <button className="btn btn-ghost">
              <LuInfo />
            </button>
          </div>
        </div>
        <AmountData amount={inventory.totalQuantityAllocated} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <Card.Root>
        <div className="flex justify-between items-center">
          <Card.Title>Soft Allocated</Card.Title>
          <div className="tooltip" data-tip="Quantity committed to draft BPRs that have not yet been confirmed. These will become Allocated once the BPR is confirmed.">
            <button className="btn btn-ghost">
              <LuInfo />
            </button>
          </div>
        </div>
        <AmountData amount={inventory.totalQuantitySoftAllocated} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <Card.Root>
        <div className="flex justify-between items-center">
          <Card.Title>Available</Card.Title>
          <div className="tooltip" data-tip="On Hand minus Allocated. The quantity free to be allocated right now.">
            <button className="btn btn-ghost">
              <LuInfo />
            </button>
          </div>
        </div>
        <AmountData amount={inventory.totalQuantityAvailable} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <Card.Root>
        <div className="flex justify-between items-center">
          <Card.Title>Soft Availability</Card.Title>
          <div className="tooltip" data-tip="Available minus Soft Allocated. The quantity that would remain free if every current draft BPR were confirmed.">
            <button className="btn btn-ghost">
              <LuInfo />
            </button>
          </div>
        </div>
        <AmountData amount={inventory.totalQuantitySoftAvailability} uomAbbreviation={inventory.item?.inventoryUom.abbreviation || ''} />
      </Card.Root>

      <OnOrderDialog />

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
