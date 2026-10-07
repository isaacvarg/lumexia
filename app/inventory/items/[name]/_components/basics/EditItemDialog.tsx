import { revalidatePage } from "@/actions/app/revalidatePage";
import itemActions from "@/actions/inventory/items";
import Dialog from "@/components/Dialog"
import Form from "@/components/Form";
import useDialog from "@/hooks/useDialog";
import { useItemSelection } from "@/store/itemSlice"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { useForm } from "react-hook-form";

type Inputs = {
  name: string
  itemTypeId: string
  procurementTypeId: string
  inventoryTypeId: string
  referenceCode: string
  isSold: boolean
};

const EditItemDialog = () => {
  const { item, options } = useItemSelection()
  const { resetDialogContext } = useDialog();

  const form = useForm<Inputs>({
    defaultValues: {
      name: item?.name || '',
      itemTypeId: item?.itemTypeId || '',
      procurementTypeId: item?.procurementTypeId || '',
      inventoryTypeId: item?.inventoryTypeId || '',
      referenceCode: item?.referenceCode || '',
      isSold: item?.isSold ?? false,
    }
  });



  const handleSubmit = async (data: Inputs) => {

    if (!item) return;

    await itemActions.update({ id: item.id }, data);

    createActivityLog("modifyItem", "item", item.id, { context: `Modified item` })
    revalidatePage("/inventory/items/[name]");
    resetDialogContext();

  };

  return (
    <Dialog.Root identifier="editItemProperties">
      <Dialog.Title>Edit Item Properties</Dialog.Title>

      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Text form={form} label="Name" fieldName="name" required />


        <Form.Text form={form} label="Reference Code" fieldName="referenceCode" required />
        <Form.Select
          form={form}
          fieldName="itemTypeId"
          label="Item Type"
          options={options.itemTypes.map((it) => ({
            value: it.id,
            label: it.name,
          }))}
        />
        <Form.Select
          form={form}
          fieldName="procurementTypeId"
          label="Procurement Type"
          options={options.procurementTypes.map((pt) => ({
            value: pt.id,
            label: pt.name,
          }))}
        />
        <Form.Select
          form={form}
          fieldName="inventoryTypeId"
          label="Inventory Type"
          options={options.inventoryTypes.map((it) => ({
            value: it.id,
            label: it.name,
          }))}
        />


        <div className="flex flex-col gap-1">
          <Form.Toggle form={form} label="Sold to customers" fieldName="isSold" />
          <p className="text-sm text-base-content/60">
            For items resold as-is. Document requirements can ask for different documents for sold items, such as our own COA.
          </p>
        </div>

        <Form.ActionRow form={form} />
      </Form.Root>

    </Dialog.Root>
  )
}

export default EditItemDialog
