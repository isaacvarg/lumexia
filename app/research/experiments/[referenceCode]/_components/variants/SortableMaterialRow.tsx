"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TbCheck, TbEdit, TbGripVertical } from "react-icons/tb";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { fractionToPercent, percentToFraction } from "@/utils/general/concentration";
import DeleteConfirm from "./DeleteConfirm";
import MoveToPhaseSelect from "./MoveToPhaseSelect";

type Material = ExperimentVariantWithMaterials["materials"][number];

type Props = {
  material: Material;
  availablePhases: string[];
};

const SortableMaterialRow = ({ material, availablePhases }: Props) => {
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState(fractionToPercent(material.concentration));

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleSave = async () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || n <= 0) {
      setDraft(fractionToPercent(material.concentration));
      setIsEdit(false);
      return;
    }
    await researchActions.variantMaterials.update({
      id: material.id,
      concentration: percentToFraction(n),
    });
    setIsEdit(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await researchActions.variantMaterials.delete({ id: material.id });
    router.refresh();
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="w-8">
        <button
          type="button"
          className="btn btn-ghost btn-xs cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <TbGripVertical />
        </button>
      </td>
      <td className="font-poppins">{material.item.name}</td>
      <td>
        {!isEdit ? (
          <span className="font-poppins">
            {fractionToPercent(material.concentration)}%
          </span>
        ) : (
          <input
            autoFocus
            type="number"
            step="any"
            min="0"
            max="100"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                setIsEdit(false);
                setDraft(fractionToPercent(material.concentration));
              }
            }}
            className="input input-sm input-bordered w-32"
          />
        )}
      </td>
      <td>
        <div className="flex gap-1 justify-end">
          {!isEdit ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEdit(true)}
              aria-label="Edit concentration"
            >
              <TbEdit />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleSave}
              aria-label="Save concentration"
            >
              <TbCheck />
            </button>
          )}
          <MoveToPhaseSelect
            materialId={material.id}
            currentPhase={material.phase}
            availablePhases={availablePhases}
          />
          <DeleteConfirm onConfirm={handleDelete} label="" />
        </div>
      </td>
    </tr>
  );
};

export default SortableMaterialRow;
