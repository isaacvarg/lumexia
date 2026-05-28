"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";
import Dialog from "@/components/Dialog";
import SearcherUnmanaged from "@/components/Search/SearcherUnmanaged";
import useDialog from "@/hooks/useDialog";
import { researchActions } from "@/actions/research";
import { Item } from "@/actions/inventory/getAllItems";
import { percentToFraction } from "@/utils/general/concentration";

type Props = {
  variantId: string;
  items: Item[];
  existingItemIds: string[];
  phase?: string | null;
};

const AddMaterialDialog = ({ variantId, items, existingItemIds, phase }: Props) => {
  const router = useRouter();
  const { resetDialogContext } = useDialog();

  const [input, setInput] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [pct, setPct] = useState("");
  const [saving, setSaving] = useState(false);

  const available = useMemo(
    () => items.filter((it) => !existingItemIds.includes(it.id)),
    [items, existingItemIds],
  );

  const handleClose = () => {
    setInput("");
    setResults([]);
    setSelected(null);
    setPct("");
    resetDialogContext();
  };

  const handleSave = async () => {
    if (!selected || !pct) return;
    const n = Number(pct);
    if (!Number.isFinite(n) || n <= 0) return;
    setSaving(true);
    try {
      await researchActions.variantMaterials.create({
        experimentVariantId: variantId,
        itemId: selected.id,
        concentration: percentToFraction(n),
        phase: phase ?? null,
      });
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root identifier={`addMaterial-${variantId}`}>
      <Dialog.Title>
        Add Material{phase ? ` — ${phase}` : ""}
      </Dialog.Title>
      {!selected ? (
        <>
          <SearcherUnmanaged
            data={available}
            keys={["name", "flatAliases", "referenceCode"]}
            input={input}
            setInput={setInput}
            onQueryComplete={setResults}
          />
          <div className="grid grid-cols-1 gap-1 overflow-auto max-h-[400px] mt-4">
            {results.map((r) => (
              <div
                key={r.id}
                className="bg-accent/20 rounded-xl py-1 px-4 font-poppins text-lg text-base-content hover:bg-accent/40 hover:cursor-pointer"
                onClick={() => setSelected(r)}
              >
                {`${r.name}${r.aliases.length !== 0 ? ` (${r.flatAliases})` : ""}`}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            className="btn btn-ghost btn-sm self-start"
            onClick={() => setSelected(null)}
          >
            <TbArrowLeft /> Pick different item
          </button>
          <div>
            <span className="font-poppins text-sm uppercase tracking-wide text-base-content/60">
              Item
            </span>
            <p className="font-poppins text-lg text-base-content">{selected.name}</p>
          </div>
          <label className="flex flex-col gap-2">
            <span className="font-medium text-xl text-base-content">Concentration (%)</span>
            <input
              autoFocus
              type="number"
              step="any"
              min="0"
              max="100"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="input input-lg w-full"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={saving || !pct || Number(pct) <= 0}
              className={`btn ${saving || !pct || Number(pct) <= 0 ? "btn-disabled" : "btn-success"}`}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </Dialog.Root>
  );
};

export default AddMaterialDialog;
