import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { TbEdit, TbPlus, TbTrash } from "react-icons/tb"
import { deleteReorderingRule } from "@/actions/inventory/reorderingRules/delete"
import { revalidatePage } from "@/actions/app/revalidatePage"
import ReorderingRuleDialog from "./ReorderingRuleDialog"

const ReorderingRule = () => {
  const { reorderingRule, item, inventory } = useItemSelection()
  const { showDialog } = useDialog()

  const uom = inventory?.item?.inventoryUom.abbreviation || ''

  const handleDelete = async () => {
    if (!item) return
    await deleteReorderingRule(item.id)
    revalidatePage("/inventory/items/[name]")
  }

  return (
    <div className="h-full">
      <div className="flex flex-col gap-y-6 h-full">
        <div className="flex justify-between items-center">
          <SectionTitle>{'Reordering Rule'}</SectionTitle>

          {reorderingRule ? (
            <div className="flex gap-x-2">
              <button className="btn btn-primary" onClick={() => showDialog("reorderingRule")}>
                <TbEdit className="size-4" />
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                <TbTrash className="size-4" />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => showDialog("reorderingRule")}>
              <TbPlus className="size-4" />
            </button>
          )}
        </div>

        <Card.Root>
          {reorderingRule ? (
            <div className="flex flex-col gap-y-2 p-4 font-poppins">
              <Row label="Threshold" value={`${reorderingRule.thresholdQuantity} ${uom}`} />
              <Row label="Buffer" value={`${reorderingRule.bufferPercent}%`} />
              <Row label="Create Audit Request" value={reorderingRule.createAuditRequest ? 'Yes' : 'No'} />
              <Row label="Create Purchasing Request" value={reorderingRule.createPurchasingRequest ? 'Yes' : 'No'} />
              <Row label="Enabled" value={reorderingRule.enabled ? 'Yes' : 'No'} />
            </div>
          ) : (
            <div className="p-4 font-poppins text-base-content/60">
              No reordering rule configured.
            </div>
          )}
        </Card.Root>

        <ReorderingRuleDialog />
      </div>
    </div>
  )
}

const Row = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between">
    <span className="text-base-content/70">{label}</span>
    <span className="font-semibold text-base-content">{value}</span>
  </div>
)

export default ReorderingRule
