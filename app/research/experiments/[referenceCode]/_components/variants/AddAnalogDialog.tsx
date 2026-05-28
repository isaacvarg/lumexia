"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";
import Dialog from "@/components/Dialog";
import useDialog from "@/hooks/useDialog";
import { researchActions } from "@/actions/research";
import { MbprByItem } from "@/actions/production/getMbprsByItem";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";

type Props = {
  experimentId: string;
  mbprs: MbprByItem[];
};

const defaultLabelFor = (mbpr: MbprByItem) =>
  `Analog of ${mbpr.versionLabel ?? "MBPR"}`;

const AddAnalogDialog = ({ experimentId, mbprs }: Props) => {
  const router = useRouter();
  const { resetDialogContext } = useDialog();

  const [selected, setSelected] = useState<MbprByItem | null>(null);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => {
    return [...mbprs].sort((a, b) => {
      const aActive = a.recordStatusId === recordStatuses.active ? 1 : 0;
      const bActive = b.recordStatusId === recordStatuses.active ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [mbprs]);

  const handleClose = () => {
    setSelected(null);
    setLabel("");
    resetDialogContext();
  };

  const handlePickMbpr = (m: MbprByItem) => {
    setSelected(m);
    setLabel(defaultLabelFor(m));
  };

  const handleSave = async () => {
    if (!selected || !label.trim()) return;
    setSaving(true);
    try {
      await researchActions.variants.createAnalog({
        experimentId,
        mbprId: selected.id,
        label: label.trim(),
      });
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root identifier="addAnalog">
      <Dialog.Title>Add Analog</Dialog.Title>
      {!selected ? (
        <div className="flex flex-col gap-2 max-h-[500px] overflow-auto mt-2">
          {sorted.length === 0 ? (
            <p className="italic text-base-content/60 font-poppins">
              No MBPRs found for this item.
            </p>
          ) : (
            sorted.map((m) => {
              const isActive = m.recordStatusId === recordStatuses.active;
              return (
                <div
                  key={m.id}
                  className="bg-accent/20 rounded-xl py-2 px-4 font-poppins text-lg text-base-content hover:bg-accent/40 hover:cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => handlePickMbpr(m)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {m.versionLabel ?? "—"}
                    </span>
                    <span className="text-sm text-base-content/60">
                      {m.BillOfMaterial.length} material
                      {m.BillOfMaterial.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {isActive && (
                    <span className="badge badge-success">Active</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm self-start"
            onClick={() => {
              setSelected(null);
              setLabel("");
            }}
          >
            <TbArrowLeft /> Pick different MBPR
          </button>
          <div>
            <span className="font-poppins text-sm uppercase tracking-wide text-base-content/60">
              Source MBPR
            </span>
            <p className="font-poppins text-lg text-base-content">
              {selected.versionLabel ?? "—"}{" "}
              <span className="text-base-content/60 text-base">
                ({selected.BillOfMaterial.length} material
                {selected.BillOfMaterial.length === 1 ? "" : "s"})
              </span>
            </p>
          </div>
          <label className="flex flex-col gap-2">
            <span className="font-medium text-xl text-base-content">Variant label</span>
            <input
              autoFocus
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="input input-lg w-full"
            />
          </label>
          <div>
            <button
              type="button"
              disabled={saving || !label.trim()}
              className={`btn ${saving || !label.trim() ? "btn-disabled" : "btn-success"}`}
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

export default AddAnalogDialog;
