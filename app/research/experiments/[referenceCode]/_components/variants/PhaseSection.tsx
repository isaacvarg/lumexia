"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TbCheck, TbEdit, TbPlus, TbX } from "react-icons/tb";
import useDialog from "@/hooks/useDialog";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import SortableMaterialRow from "./SortableMaterialRow";

type Material = ExperimentVariantWithMaterials["materials"][number];

type Props = {
  variantId: string;
  phase: string | null; // null = Unphased bucket
  materials: Material[];
  availablePhases: string[];
  onAddMaterial: (phase: string | null) => void;
  showHeader: boolean;
};

const PhaseSection = ({
  variantId,
  phase,
  materials,
  availablePhases,
  onAddMaterial,
  showHeader,
}: Props) => {
  const router = useRouter();
  const { showDialog } = useDialog();
  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState(phase ?? "");

  const handleRename = async () => {
    if (!phase) return;
    const next = draft.trim();
    if (!next || next === phase) {
      setIsRenaming(false);
      setDraft(phase);
      return;
    }
    await researchActions.variantMaterials.renamePhase({
      variantId,
      from: phase,
      to: next,
    });
    setIsRenaming(false);
    router.refresh();
  };

  const handleClearPhase = async () => {
    if (!phase) return;
    await researchActions.variantMaterials.renamePhase({
      variantId,
      from: phase,
      to: null,
    });
    router.refresh();
  };

  const handleAdd = () => {
    onAddMaterial(phase);
    showDialog(`addMaterial-${variantId}`);
  };

  return (
    <div className="flex flex-col gap-2">
      {showHeader && (
        <div className="flex items-center justify-between border-b border-base-300 pb-1">
          {!isRenaming ? (
            <div className="flex items-center gap-2">
              <h4 className="font-poppins text-base font-semibold uppercase tracking-wide text-base-content/70">
                {phase ?? "Unphased"}
              </h4>
              {phase !== null && (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setIsRenaming(true)}
                    aria-label="Rename phase"
                  >
                    <TbEdit />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={handleClearPhase}
                    aria-label="Clear phase"
                  >
                    <TbX />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className="input input-sm input-bordered"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRename();
                  }
                  if (e.key === "Escape") {
                    setIsRenaming(false);
                    setDraft(phase ?? "");
                  }
                }}
              />
              <button type="button" className="btn btn-success btn-xs" onClick={handleRename}>
                <TbCheck />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  setIsRenaming(false);
                  setDraft(phase ?? "");
                }}
              >
                <TbX />
              </button>
            </div>
          )}
        </div>
      )}

      {materials.length === 0 ? (
        <p className="italic text-base-content/50 font-poppins text-sm">
          No materials in this phase.
        </p>
      ) : (
        <div className="w-full overflow-x-auto"><table className="table">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Item</th>
              <th className="w-48">Concentration</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={materials.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {materials.map((m) => (
                <SortableMaterialRow
                  key={m.id}
                  material={m}
                  availablePhases={availablePhases}
                />
              ))}
            </SortableContext>
          </tbody>
        </table></div>
      )}

      <div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleAdd}
        >
          <TbPlus /> Add material{phase ? ` to ${phase}` : ""}
        </button>
      </div>
    </div>
  );
};

export default PhaseSection;
