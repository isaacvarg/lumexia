"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbCheck, TbEdit, TbPlus, TbX } from "react-icons/tb";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import { researchActions } from "@/actions/research";
import { CostBatchSizeRow } from "@/actions/research/costBatchSizes/getAll";
import DeleteConfirm from "../../experiments/[referenceCode]/_components/variants/DeleteConfirm";

type Props = {
  batchSizes: CostBatchSizeRow[];
};

const BatchSizeManager = ({ batchSizes }: Props) => {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = async () => {
    const q = Number(quantity);
    if (!label.trim() || !Number.isFinite(q) || q <= 0) return;
    await researchActions.costBatchSizes.create({
      label: label.trim(),
      quantityLb: q,
    });
    setLabel("");
    setQuantity("");
    setAdding(false);
    router.refresh();
  };

  return (
    <Card.Root>
      <div className="flex items-center justify-between">
        <SectionTitle>Default Batch Sizes</SectionTitle>
        {!adding && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAdding(true)}
          >
            <TbPlus /> Add batch size
          </button>
        )}
      </div>
      <p className="font-poppins text-base-content/60">
        Quantities are in pounds (lb). These appear automatically on every experiment&apos;s
        Cost tab.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {batchSizes.length === 0 && !adding && (
          <p className="italic text-base-content/50 font-poppins">
            No batch sizes configured yet.
          </p>
        )}

        {batchSizes.map((bs) => (
          <BatchSizeRow key={bs.id} batchSize={bs} />
        ))}

        {adding && (
          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="font-poppins text-sm text-base-content/60">Label</label>
              <input
                autoFocus
                className="input input-bordered input-sm"
                placeholder="e.g. Pilot batch"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-poppins text-sm text-base-content/60">
                Quantity (lb)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="input input-bordered input-sm w-32"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-success btn-sm" onClick={handleAdd}>
              <TbCheck /> Save
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setAdding(false);
                setLabel("");
                setQuantity("");
              }}
            >
              <TbX /> Cancel
            </button>
          </div>
        )}
      </div>
    </Card.Root>
  );
};

const BatchSizeRow = ({ batchSize }: { batchSize: CostBatchSizeRow }) => {
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const [label, setLabel] = useState(batchSize.label);
  const [quantity, setQuantity] = useState(String(batchSize.quantityLb));

  const handleSave = async () => {
    const q = Number(quantity);
    if (!label.trim() || !Number.isFinite(q) || q <= 0) {
      setLabel(batchSize.label);
      setQuantity(String(batchSize.quantityLb));
      setIsEdit(false);
      return;
    }
    await researchActions.costBatchSizes.update({
      id: batchSize.id,
      label: label.trim(),
      quantityLb: q,
    });
    setIsEdit(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await researchActions.costBatchSizes.delete({ id: batchSize.id });
    router.refresh();
  };

  if (isEdit) {
    return (
      <div className="flex items-end gap-2 flex-wrap rounded-xl border border-base-300 p-2">
        <input
          className="input input-bordered input-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          type="number"
          step="any"
          min="0"
          className="input input-bordered input-sm w-32"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button type="button" className="btn btn-success btn-sm" onClick={handleSave}>
          <TbCheck />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setIsEdit(false);
            setLabel(batchSize.label);
            setQuantity(String(batchSize.quantityLb));
          }}
        >
          <TbX />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-base-300 px-3 py-2">
      <span className="font-poppins">
        <span className="font-medium">{batchSize.label}</span>
        <span className="text-base-content/60"> — {batchSize.quantityLb} lb</span>
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setIsEdit(true)}
          aria-label="Edit batch size"
        >
          <TbEdit />
        </button>
        <DeleteConfirm onConfirm={handleDelete} label="" />
      </div>
    </div>
  );
};

export default BatchSizeManager;
