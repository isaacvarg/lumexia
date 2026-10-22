import { revalidatePage } from "@/actions/app/revalidatePage"
import aliasActions from "@/actions/inventory/aliases"
import supplierAliasActions from "@/actions/purchasing/supplierAliasActions"
import Dialog from "@/components/Dialog"
import Form from "@/components/Form"
import Layout from "@/components/Layout"
import { aliasTypes } from "@/configs/staticRecords/aliasTypes"
import useDialog from "@/hooks/useDialog"
import useToast from "@/hooks/useToast"
import { checkAliasConflict } from "@/app/inventory/_actions/checkAliasConflict"
import { useItemActions, useItemSelection } from "@/store/itemSlice"
import { SelectOption } from "@/types/selectOption"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { restructureData } from "@/utils/data/restructureData"
import { revalidatePath } from "next/cache"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { TbTrash } from "react-icons/tb"

const SupplierAliasType = aliasTypes.supplier;

type Inputs = {
  name: string;
  aliasTypeId: string;
  supplierId?: string;
}


const restructureAs = [
  { key: "id", rename: "value" },
  { key: "name", rename: "label" },
];

type AliasCreatePayload = Inputs & { itemId: string };

const AliasDialog = () => {

  const { selectedAlias, item, options } = useItemSelection();
  const { setSelectedAlias } = useItemActions()
  const { resetDialogContext } = useDialog();
  const { toast } = useToast();



  const form = useForm<Inputs>({ defaultValues: { name: '', aliasTypeId: '' } })
  const wathchAliasType = form.watch('aliasTypeId');

  const handleSubmit = async (data: Inputs) => {
    // unique alias types (e.g. a WooCommerce product id) belong to one item
    const owner = await checkAliasConflict({ aliasTypeId: data.aliasTypeId, name: data.name, excludeAliasId: selectedAlias?.id })
    if (owner) {
      toast('Alias already used', `${data.name} is already an alias of ${owner.name} (${owner.referenceCode}), and this alias type is unique.`, 'error')
      return
    }

    if (selectedAlias) {
      handleUpdate(data);
      return;
    }

    handleAdd(data);
  }


  const handleAdd = async (data: Inputs) => {
    if (!item) throw new Error('Cannot add alias without item.');

    // create  payload
    const payload: AliasCreatePayload = {
      name: data.name,
      aliasTypeId: data.aliasTypeId,
      itemId: item.id,
    };

    // add alias 
    const aliasResponse = await aliasActions.createNew(payload)
    // handle supplier alias

    if (data.aliasTypeId === SupplierAliasType) {
      await supplierAliasActions.createNew(({
        aliasId: aliasResponse.id,
        supplierId: data.supplierId,
      }));
    }

    // log creation
    await createActivityLog('createAlias', 'item', item.id, { context: `${aliasResponse.name} was created.` })
    // reset

    revalidatePage('/inventory/items/[name]/')
    resetDialogContext()

  }

  // this is messy function but it works i guess
  const handleUpdate = async (data: Inputs) => {

    if (!selectedAlias) throw new Error('Cannot update without selected Alias');
    if (!item) throw new Error('Cannot update without selected item');

    // update  payload
    const payload = {
      name: data.name,
      aliasTypeId: data.aliasTypeId,
    };
    const originalType = selectedAlias.aliasTypeId;

    // update alias
    const aliasResponse = await aliasActions.update({ id: selectedAlias.id }, payload);
    // check if supplier alias and if supplier id changed
    if (data.aliasTypeId === SupplierAliasType) {

      // was it changed to supplier alias from other type?
      if (originalType !== SupplierAliasType) {

        // yes, add supplier alias
        await supplierAliasActions.createNew({
          aliasId: aliasResponse.id,
          supplierId: data.supplierId,
        });
        await createActivityLog('modifyAlias', 'item', item.id, { context: `${data.name} was changed to supplier type.` })
      } else {
        const originalSupplierId = selectedAlias.supplierAlias[0].supplierId
        // no, was already supplier alias
        // is supplier different?

        if (originalSupplierId !== data.supplierId) {
          // yes, update supplierid in link
          await supplierAliasActions.update({ id: selectedAlias.supplierAlias[0].id }, { supplierId: data.supplierId })
          await createActivityLog('modifyAlias', 'item', item.id, { context: `${data.name} supplier alias had linked supplier changed.` })
        }
        // no, do nothing
      }
    }

    // delete supplier alias if no longer a supplieralias type
    if (originalType === SupplierAliasType && data.aliasTypeId !== SupplierAliasType) {
      await supplierAliasActions.deleteOne({ id: selectedAlias.supplierAlias[0].id });
      await createActivityLog('modifyAlias', 'item', item.id, { context: `Alias type was changed from supplier. Removed supplier alias link.` })
    }

    // make logs 
    if (selectedAlias.name !== data.name) {
      await createActivityLog('modifyAlias', 'item', item.id, { context: `Alias was modified from ${selectedAlias.name} to ${data.name}. Other modifications will be listed separetely.` })
    }

    // reset
    setSelectedAlias(null)
    revalidatePage('/inventory/items/[item]')
    resetDialogContext()

  }

  const handleDelete = async () => {

    if (!selectedAlias) return;

    // delete supplier link if needed
    if (selectedAlias.aliasTypeId === SupplierAliasType) {
      await supplierAliasActions.deleteOne({ id: selectedAlias.supplierAlias[0].id })
    }

    // deleted alias
    await aliasActions.deleteOne({ id: selectedAlias.id });

    // log deletion
    await createActivityLog('aliasDeleted', "item", selectedAlias.itemId, { context: `${selectedAlias.name} alias was removed` });

    setSelectedAlias(null)
    revalidatePage('/inventory/items/[item]')
    resetDialogContext()
  }

  useEffect(() => {
    const defaults = (
      selectedAlias ? {
        name: selectedAlias.name,
        aliasTypeId: selectedAlias.aliasTypeId,
        ...(selectedAlias.aliasTypeId === SupplierAliasType && { supplierId: selectedAlias.supplierAlias[0].supplierId })
      } : {
        name: '',
        aliasTypeId: '',
      }
    )

    form.reset(defaults);
  }, [selectedAlias, setSelectedAlias, form])


  return (
    <Dialog.Root identifier="aliasDialog">

      <Layout.Row>      <Dialog.Title>
        {selectedAlias ? `Edit ${selectedAlias.name}` : 'New Alias'}
      </Dialog.Title>

        {selectedAlias && <button onClick={() => handleDelete()} className="btn btn-soft btn-error btn-sm"> <span className="text-xl"><TbTrash /></span> Delete</button>}
      </Layout.Row>



      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Text form={form} fieldName="name" label="Name" required={true} />
        <Form.Select
          form={form}
          label="Alias Type"
          fieldName="aliasTypeId"
          options={restructureData(options.aliasTypes, restructureAs) as SelectOption[]}
        />

        {wathchAliasType === SupplierAliasType && (
          <Form.Select
            form={form}
            label="supplier"
            fieldName="supplierId"
            options={restructureData(options.suppliers, restructureAs) as SelectOption[]}
          />
        )}

        <Form.ActionRow form={form} />
      </Form.Root>

    </Dialog.Root>
  )
}

export default AliasDialog
