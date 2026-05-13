import { revalidatePage } from "@/actions/app/revalidatePage"
import { upsertReorderingRule } from "@/actions/inventory/reorderingRules/upsert"
import Dialog from "@/components/Dialog"
import Form from "@/components/Form"
import useDialog from "@/hooks/useDialog"
import { useItemSelection } from "@/store/itemSlice"
import { useForm } from "react-hook-form"

type Inputs = {
  thresholdQuantity: number
  bufferPercent: number
  createAuditRequest: boolean
  createPurchasingRequest: boolean
  enabled: boolean
}

const ReorderingRuleDialog = () => {
  const { item, reorderingRule } = useItemSelection()
  const { resetDialogContext } = useDialog()

  const form = useForm<Inputs>({
    defaultValues: {
      thresholdQuantity: reorderingRule?.thresholdQuantity ?? 0,
      bufferPercent: reorderingRule?.bufferPercent ?? 5,
      createAuditRequest: reorderingRule?.createAuditRequest ?? false,
      createPurchasingRequest: reorderingRule?.createPurchasingRequest ?? false,
      enabled: reorderingRule?.enabled ?? true,
    },
  })

  const handleSubmit = async (data: Inputs) => {
    if (!item) return
    await upsertReorderingRule(item.id, data)
    revalidatePage("/inventory/items/[name]")
    resetDialogContext()
  }

  return (
    <Dialog.Root identifier="reorderingRule">
      <Dialog.Title>{reorderingRule ? 'Edit Reordering Rule' : 'Add Reordering Rule'}</Dialog.Title>

      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Number form={form} label="Threshold Quantity" fieldName="thresholdQuantity" required />
        <Form.Number form={form} label="Buffer Percent" fieldName="bufferPercent" required />
        <Form.Toggle form={form} label="Create Audit Request" fieldName="createAuditRequest" />
        <Form.Toggle form={form} label="Create Purchasing Request" fieldName="createPurchasingRequest" />
        <Form.Toggle form={form} label="Enabled" fieldName="enabled" />

        <Form.ActionRow form={form} />
      </Form.Root>
    </Dialog.Root>
  )
}

export default ReorderingRuleDialog
