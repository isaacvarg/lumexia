"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TbArrowLeft, TbFlask, TbNote, TbPaperclip, TbRulerMeasure } from "react-icons/tb";
import { researchActions } from "@/actions/research";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { Uom } from "@/actions/inventory/getAllUom";
import { ExperimentNoteTypeRow } from "@/actions/research/experimentNoteTypes/getAll";
import { SampleNoteRow } from "@/actions/research/sampleNotes/getAllBySample";
import { SampleFileRow } from "@/actions/research/sampleFiles/getAllBySample";
import EditSampleDialog from "./EditSampleDialog";
import SamplePreparationBody from "./SamplePreparationBody";
import SampleNotesPanel from "./SampleNotesPanel";
import SampleFilesPanel from "./SampleFilesPanel";
import SampleMeasurementBody from "./SampleMeasurementBody";
import CopyForLlmButton from "../shared/CopyForLlmButton";

export type SampleFocusedMode = "preparation" | "notes" | "files" | "measurement";

type Props = {
  sample: ExperimentSampleRow;
  variant: ExperimentVariantWithMaterials;
  uoms: Uom[];
  noteTypes: ExperimentNoteTypeRow[];
  mode: SampleFocusedMode;
  onModeChange: (mode: SampleFocusedMode) => void;
  onBack: () => void;
};

const formatSampleRef = (code: number) => `S-${String(code).padStart(2, "0")}`;

const SampleFocusedView = ({
  sample,
  variant,
  uoms,
  noteTypes,
  mode,
  onModeChange,
  onBack,
}: Props) => {
  const router = useRouter();
  const [notes, setNotes] = useState<SampleNoteRow[]>([]);
  const [files, setFiles] = useState<SampleFileRow[]>([]);

  const reload = useCallback(async () => {
    const [n, f] = await Promise.all([
      researchActions.sampleNotes.getAllBySample(sample.id),
      researchActions.sampleFiles.getAllBySample(sample.id),
    ]);
    setNotes(n);
    setFiles(f);
  }, [sample.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // When the parent refreshes (router.refresh), the sample prop may change
  // (e.g. preparedAt). Pull sample-scoped notes/files again on that signal too.
  useEffect(() => {
    reload();
  }, [sample, reload]);

  const modes: { value: SampleFocusedMode; label: string; icon: JSX.Element }[] = [
    { value: "preparation", label: "Preparation", icon: <TbFlask /> },
    { value: "measurement", label: "Measure", icon: <TbRulerMeasure /> },
    { value: "notes", label: "Notes", icon: <TbNote /> },
    { value: "files", label: "Files", icon: <TbPaperclip /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onBack}
            aria-label="Back to samples"
          >
            <TbArrowLeft /> Back
          </button>
          <h2 className="font-poppins text-2xl font-semibold">
            {formatSampleRef(sample.referenceCode)} —{" "}
            <span className="text-base-content/80">{sample.label}</span>
          </h2>
          <span className="font-poppins text-base-content/60">
            from {variant.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="join">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`join-item btn btn-sm ${mode === m.value ? "btn-primary" : "btn-ghost"}`}
                onClick={() => onModeChange(m.value)}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
          <CopyForLlmButton
            tooltip="Copy this sample for an LLM"
            getText={() => researchActions.llmContext.getSampleContext(sample.id)}
          />
        </div>
      </div>

      {mode === "preparation" && (
        <SamplePreparationBody sample={sample} variant={variant} />
      )}
      {mode === "measurement" && <SampleMeasurementBody sample={sample} />}
      {mode === "notes" && (
        <SampleNotesPanel sample={sample} notes={notes} noteTypes={noteTypes} />
      )}
      {mode === "files" && <SampleFilesPanel sample={sample} files={files} />}

      <EditSampleDialog sample={sample} uoms={uoms} />
    </div>
  );
};

export default SampleFocusedView;
