"use client";
import { Uom } from "@/actions/inventory/getAllUom";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import useDialog from "@/hooks/useDialog";
import useToast from "@/hooks/useToast";
import { InventoryType } from "@/types/inventoryType";
import { ItemType } from "@/types/itemType";
import { ProcurementType } from "@/types/procurementType";
import { SelectOption } from "@/types/selectOption";
import { restructureData } from "@/utils/data/restructureData";
import { getSlug } from "@/utils/general/getSlug";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createItem, CreateItemInput } from "../_actions/createItem";
import { generateSku } from "../_actions/generateSku";

type Inputs = CreateItemInput;

type CreateItemFormProps = {
  itemTypes: ItemType[];
  inventoryTypes: InventoryType[];
  procurementTypes: ProcurementType[];
  uoms: Uom[];
};


const CreateItemForm = ({
  itemTypes,
  inventoryTypes,
  procurementTypes,
  uoms,

}: CreateItemFormProps) => {
  const form = useForm<Inputs>();
  const restructureAs = [
    { key: "id", rename: "value" },
    { key: "name", rename: "label" },
  ];

  const { resetDialogContext } = useDialog();
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const itemTypeId = form.watch("itemTypeId");

  const handleGenerateSku = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSku(itemTypeId);
      if (!result.success) {
        toast("Couldn't generate a SKU", result.error, "error");
        return;
      }
      form.setValue("referenceCode", result.sku, { shouldValidate: true, shouldDirty: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (data: Inputs) => {
    setSubmitError(null);
    const result = await createItem(data);
    if (!result.success) {
      setSubmitError(result.error);
      return;
    }
    form.reset();
    resetDialogContext();
    // The items table has no sort and keeps its page/search between visits, so a new
    // item usually lands out of sight; open it instead so it's clear it was created.
    toast("Item created", `${result.item.name} was added.`, "success");
    router.push(`/inventory/items/${getSlug(result.item.name)}?id=${result.item.id}`);
  };

  return (
    <Dialog.Root identifier="createItem">
      <Dialog.Title>Create Item</Dialog.Title>
      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Text form={form} label="Name" fieldName="name" required />
        <Form.Select
          form={form}
          label="Item Type"
          fieldName="itemTypeId"
          required
          options={restructureData(itemTypes, restructureAs) as SelectOption[]}
        />
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Form.Text
              form={form}
              label="Reference Code"
              fieldName="referenceCode"
              required
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-soft btn-lg mt-8"
            onClick={handleGenerateSku}
            disabled={!itemTypeId || isGenerating}
            title={itemTypeId ? "Generate the next SKU for this item type" : "Choose an item type first"}
          >
            {isGenerating ? <span className="loading loading-spinner loading-sm" /> : "Generate"}
          </button>
        </div>
        <Form.Select
          form={form}
          label="Inventory Type"
          fieldName="inventoryTypeId"
          required
          options={
            restructureData(inventoryTypes, restructureAs) as SelectOption[]
          }
        />
        <Form.Select
          form={form}
          label="Procurement Type"
          fieldName="procurementTypeId"
          required
          options={
            restructureData(procurementTypes, restructureAs) as SelectOption[]
          }
        />

        <Form.Select
          form={form}
          label="Inventory Unit of Measurement"
          fieldName="inventoryUomId"
          required
          options={
            restructureData(uoms, restructureAs) as SelectOption[]
          }
        />

        {submitError && (
          <div role="alert" className="alert alert-error alert-soft">
            <span>{submitError}</span>
          </div>
        )}

        <Form.ActionRow form={form} />
      </Form.Root>
    </Dialog.Root>
  );
};

export default CreateItemForm;
