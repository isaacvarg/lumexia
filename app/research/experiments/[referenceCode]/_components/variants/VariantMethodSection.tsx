"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TbPlus } from "react-icons/tb";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { groupVariantMaterialsByPhase } from "@/utils/general/groupVariantMaterials";
import SortableMethodStep from "./SortableMethodStep";

type Props = {
  variant: ExperimentVariantWithMaterials;
};

type MethodStep = ExperimentVariantWithMaterials["methodSteps"][number];

const VariantMethodSection = ({ variant }: Props) => {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");

  const [localSteps, setLocalSteps] = useState<MethodStep[]>(variant.methodSteps);
  useEffect(() => {
    setLocalSteps(variant.methodSteps);
  }, [variant.methodSteps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const availablePhases = useMemo(() => {
    const { orderedKeys } = groupVariantMaterialsByPhase(variant.materials);
    return orderedKeys.filter((k): k is string => k !== null);
  }, [variant.materials]);

  const handleAdd = async () => {
    const content = newContent.trim();
    if (!content) {
      setAdding(false);
      setNewContent("");
      return;
    }
    await researchActions.methodSteps.create({
      experimentVariantId: variant.id,
      content,
    });
    setNewContent("");
    setAdding(false);
    router.refresh();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localSteps.findIndex((s) => s.id === active.id);
    const newIndex = localSteps.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(localSteps, oldIndex, newIndex);
    setLocalSteps(reordered.map((s, i) => ({ ...s, sequence: i })));

    await researchActions.methodSteps.reorder({
      variantId: variant.id,
      orderedIds: reordered.map((s) => s.id),
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-poppins text-base font-semibold uppercase tracking-wide text-base-content/70">
        Method
      </h4>

      {localSteps.length === 0 && !adding ? (
        <p className="italic text-base-content/50 font-poppins">
          No method yet — add steps or copy from an MBPR analog.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSteps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {localSteps.map((step, i) => (
                <SortableMethodStep
                  key={step.id}
                  step={step}
                  index={i}
                  availablePhases={availablePhases}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {adding ? (
        <div className="flex flex-col gap-2">
          <textarea
            autoFocus
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Describe this step…"
            className="textarea textarea-bordered w-full"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setAdding(false);
                setNewContent("");
              }
            }}
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
              Add step
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setAdding(false);
                setNewContent("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm self-start"
          onClick={() => setAdding(true)}
        >
          <TbPlus /> Add step
        </button>
      )}
    </div>
  );
};

export default VariantMethodSection;
