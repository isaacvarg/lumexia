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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TbCheck, TbEdit, TbPlus, TbX } from "react-icons/tb";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { Item } from "@/actions/inventory/getAllItems";
import { fractionToPercent } from "@/utils/general/concentration";
import { groupVariantMaterialsByPhase } from "@/utils/general/groupVariantMaterials";
import useDialog from "@/hooks/useDialog";
import AddMaterialDialog from "./AddMaterialDialog";
import DeleteConfirm from "./DeleteConfirm";
import PhaseSection from "./PhaseSection";
import VariantMethodSection from "./VariantMethodSection";
import CopyForLlmButton from "../shared/CopyForLlmButton";

type Props = {
  variant: ExperimentVariantWithMaterials;
  items: Item[];
};

type Material = ExperimentVariantWithMaterials["materials"][number];

const TOTAL_TOLERANCE = 0.001;

const VariantCard = ({ variant, items }: Props) => {
  const router = useRouter();
  const { showDialog, resetDialogContext } = useDialog();
  const deleteAlertId = `variantDeleteError-${variant.id}`;
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [localMaterials, setLocalMaterials] = useState<Material[]>(variant.materials);
  useEffect(() => {
    setLocalMaterials(variant.materials);
  }, [variant.materials]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [labelDraft, setLabelDraft] = useState(variant.label);

  // Phase context for AddMaterialDialog — set by the section that triggered Add.
  const [targetPhase, setTargetPhase] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const total = localMaterials.reduce((sum, m) => sum + m.concentration, 0);
  const isAtHundred = Math.abs(total - 1) < TOTAL_TOLERANCE;
  const totalPill = (
    <span
      className="px-3 py-1 rounded-xl font-poppins font-medium text-sm"
      style={{
        backgroundColor: isAtHundred ? "#D8E2DC" : "#FFD7BA",
        color: "#333333",
      }}
    >
      Total: {fractionToPercent(total)}%
    </span>
  );

  const handleRename = async () => {
    const next = labelDraft.trim();
    if (!next || next === variant.label) {
      setIsRenaming(false);
      setLabelDraft(variant.label);
      return;
    }
    await researchActions.variants.update({ id: variant.id, label: next });
    setIsRenaming(false);
    router.refresh();
  };

  const handleDeleteVariant = async () => {
    try {
      await researchActions.variants.delete({ id: variant.id });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete variant.";
      setDeleteError(message);
      showDialog(deleteAlertId);
    }
  };

  const { groups, orderedKeys } = useMemo(
    () => groupVariantMaterialsByPhase(localMaterials),
    [localMaterials],
  );

  const hasAnyPhases = orderedKeys.some((k) => k !== null);
  const availablePhases = orderedKeys.filter((k): k is string => k !== null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find which phase contains the active material.
    const activeMaterial = localMaterials.find((m) => m.id === active.id);
    if (!activeMaterial) return;
    const phaseKey = activeMaterial.phase && activeMaterial.phase.trim()
      ? activeMaterial.phase
      : null;
    const phaseMaterials = groups.get(phaseKey)!;

    const oldIndex = phaseMaterials.findIndex((m) => m.id === active.id);
    const newIndex = phaseMaterials.findIndex((m) => m.id === over.id);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const reorderedPhase = arrayMove(phaseMaterials, oldIndex, newIndex);

    // Build the new full ordered list across all phases, in display order.
    const fullOrder: Material[] = [];
    for (const key of orderedKeys) {
      if (key === phaseKey) {
        fullOrder.push(...reorderedPhase);
      } else {
        fullOrder.push(...groups.get(key)!);
      }
    }

    // Optimistic: stamp sequences locally so the UI updates instantly.
    setLocalMaterials(
      fullOrder.map((m, i) => ({ ...m, sequence: i })),
    );

    await researchActions.variantMaterials.reorder({
      variantId: variant.id,
      orderedIds: fullOrder.map((m) => m.id),
    });
    router.refresh();
  };

  const handleAddMaterial = (phase: string | null) => {
    setTargetPhase(phase);
  };

  const existingItemIds = localMaterials.map((m) => m.itemId);

  const handleNewPhase = async () => {
    const name = window.prompt("New phase name");
    if (!name?.trim()) return;
    setTargetPhase(name.trim());
    showDialog(`addMaterial-${variant.id}`);
  };

  return (
    <Card.Root>
      <div className="flex items-center justify-between flex-wrap gap-3">
        {!isRenaming ? (
          <div className="flex items-center gap-2">
            <h3 className="font-poppins text-2xl font-semibold text-base-content">
              {variant.label}
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setIsRenaming(true)}
              aria-label="Rename variant"
            >
              <TbEdit />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              className="input input-bordered"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setLabelDraft(variant.label);
                }
              }}
            />
            <button type="button" className="btn btn-success btn-sm" onClick={handleRename}>
              <TbCheck />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsRenaming(false);
                setLabelDraft(variant.label);
              }}
            >
              <TbX />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {totalPill}
          <CopyForLlmButton
            tooltip="Copy this variant for an LLM"
            getText={() => researchActions.llmContext.getVariantContext(variant.id)}
          />
          <DeleteConfirm onConfirm={handleDeleteVariant} label="Delete variant" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {localMaterials.length === 0 ? (
          <p className="italic text-base-content/50 font-poppins">No materials yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {orderedKeys.map((key) => (
              <PhaseSection
                key={key ?? "__unphased__"}
                variantId={variant.id}
                phase={key}
                materials={groups.get(key)!}
                availablePhases={availablePhases}
                onAddMaterial={handleAddMaterial}
                showHeader={hasAnyPhases}
              />
            ))}
          </DndContext>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {localMaterials.length === 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTargetPhase(null);
              showDialog(`addMaterial-${variant.id}`);
            }}
          >
            <TbPlus /> Add material
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleNewPhase}
        >
          <TbPlus /> New phase
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-base-300">
        <VariantMethodSection variant={variant} />
      </div>

      <AddMaterialDialog
        variantId={variant.id}
        items={items}
        existingItemIds={existingItemIds}
        phase={targetPhase}
      />

      <Alert.Root identifier={deleteAlertId}>
        <Alert.Content
          title="Can't delete variant"
          action={() => {
            setDeleteError(null);
            resetDialogContext();
          }}
          actionLabel="OK"
          actionColor="warning"
        >
          {deleteError ?? ""}
        </Alert.Content>
      </Alert.Root>
    </Card.Root>
  );
};

export default VariantCard;
