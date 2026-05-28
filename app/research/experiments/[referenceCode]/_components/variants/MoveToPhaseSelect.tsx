"use client";
import { useRouter } from "next/navigation";
import { TbArrowsExchange } from "react-icons/tb";
import { researchActions } from "@/actions/research";

type Props = {
  materialId: string;
  currentPhase: string | null;
  availablePhases: string[];
};

const MoveToPhaseSelect = ({ materialId, currentPhase, availablePhases }: Props) => {
  const router = useRouter();

  const handleMove = async (target: string | null) => {
    await researchActions.variantMaterials.setPhase({ id: materialId, phase: target });
    router.refresh();
  };

  const handleNewPhase = async () => {
    const name = window.prompt("New phase name");
    if (!name?.trim()) return;
    await researchActions.variantMaterials.setPhase({
      id: materialId,
      phase: name.trim(),
    });
    router.refresh();
  };

  const options = availablePhases.filter((p) => p !== currentPhase);

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-sm"
        aria-label="Move to phase"
      >
        <TbArrowsExchange />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box shadow z-10 w-52 p-2"
      >
        {currentPhase !== null && (
          <li>
            <a onClick={() => handleMove(null)}>Unphased</a>
          </li>
        )}
        {options.map((p) => (
          <li key={p}>
            <a onClick={() => handleMove(p)}>{p}</a>
          </li>
        ))}
        <li>
          <a onClick={handleNewPhase} className="italic">
            + New phase…
          </a>
        </li>
      </ul>
    </div>
  );
};

export default MoveToPhaseSelect;
