"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TbCheck, TbEdit, TbGripVertical, TbX } from "react-icons/tb";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import DeleteConfirm from "./DeleteConfirm";

type MethodStep = ExperimentVariantWithMaterials["methodSteps"][number];

type Props = {
  step: MethodStep;
  index: number;
  availablePhases: string[];
};

const SortableMethodStep = ({ step, index, availablePhases }: Props) => {
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState(step.content);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleSave = async () => {
    const next = draft.trim();
    if (!next || next === step.content) {
      setDraft(step.content);
      setIsEdit(false);
      return;
    }
    await researchActions.methodSteps.update({ id: step.id, content: next });
    setIsEdit(false);
    router.refresh();
  };

  const handleSetPhase = async (phase: string | null) => {
    await researchActions.methodSteps.update({ id: step.id, phase });
    router.refresh();
  };

  const handleDelete = async () => {
    await researchActions.methodSteps.delete({ id: step.id });
    router.refresh();
  };

  const phaseOptions = availablePhases.filter((p) => p !== step.phase);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-xl border border-base-300 p-3"
    >
      <button
        type="button"
        className="btn btn-ghost btn-xs cursor-grab active:cursor-grabbing mt-1"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <TbGripVertical />
      </button>

      <span className="font-poppins font-semibold text-base-content/50 w-6 shrink-0 mt-1.5 text-right">
        {index + 1}.
      </span>

      <div className="flex-1 flex flex-col gap-2">
        {!isEdit ? (
          <p className="font-poppins whitespace-pre-wrap">{step.content}</p>
        ) : (
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEdit(false);
                setDraft(step.content);
              }
            }}
            className="textarea textarea-bordered w-full"
          />
        )}
        {step.phase && (
          <span className="badge badge-sm badge-ghost self-start">{step.phase}</span>
        )}
      </div>

      <div className="flex gap-1 shrink-0">
        {!isEdit ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsEdit(true)}
            aria-label="Edit step"
          >
            <TbEdit />
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleSave}
              aria-label="Save step"
            >
              <TbCheck />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsEdit(false);
                setDraft(step.content);
              }}
              aria-label="Cancel edit"
            >
              <TbX />
            </button>
          </>
        )}

        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-ghost btn-sm"
            aria-label="Tag with phase"
          >
            {step.phase ?? "Phase"}
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box shadow z-10 w-52 p-2"
          >
            {step.phase !== null && (
              <li>
                <a onClick={() => handleSetPhase(null)}>No phase</a>
              </li>
            )}
            {phaseOptions.map((p) => (
              <li key={p}>
                <a onClick={() => handleSetPhase(p)}>{p}</a>
              </li>
            ))}
          </ul>
        </div>

        <DeleteConfirm onConfirm={handleDelete} label="" />
      </div>
    </div>
  );
};

export default SortableMethodStep;
