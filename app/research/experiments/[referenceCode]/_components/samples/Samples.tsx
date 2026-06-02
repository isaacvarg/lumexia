"use client";
import { useState } from "react";
import Card from "@/components/Card";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { Uom } from "@/actions/inventory/getAllUom";
import { ExperimentNoteTypeRow } from "@/actions/research/experimentNoteTypes/getAll";
import VariantSamplesCard from "./VariantSamplesCard";
import SampleFocusedView, { SampleFocusedMode } from "./SampleFocusedView";

type Props = {
  experimentId: string;
  experimentReferenceCode: number;
  primarySubject: string;
  variants: ExperimentVariantWithMaterials[];
  samples: ExperimentSampleRow[];
  uoms: Uom[];
  noteTypes: ExperimentNoteTypeRow[];
};

type FocusedState = { id: string; mode: SampleFocusedMode };

const Samples = ({
  experimentId,
  experimentReferenceCode,
  primarySubject,
  variants,
  samples,
  uoms,
  noteTypes,
}: Props) => {
  const [focused, setFocused] = useState<FocusedState | null>(null);

  if (focused) {
    const sample = samples.find((s) => s.id === focused.id) ?? null;
    const variant =
      sample != null
        ? variants.find((v) => v.id === sample.experimentVariantId) ?? null
        : null;
    if (sample && variant) {
      return (
        <SampleFocusedView
          sample={sample}
          variant={variant}
          uoms={uoms}
          noteTypes={noteTypes}
          mode={focused.mode}
          onModeChange={(mode) => setFocused({ id: focused.id, mode })}
          onBack={() => setFocused(null)}
        />
      );
    }
    setFocused(null);
  }

  if (variants.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-poppins text-xl font-semibold text-base-content">
          Samples
        </h2>
        <Card.Root>
          <p className="font-poppins text-lg text-base-content/60 italic">
            Create a variant first on the Variants tab — samples are batches of a specific formulation.
          </p>
        </Card.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-poppins text-xl font-semibold text-base-content">
        Samples
      </h2>
      <div className="flex flex-col gap-4">
        {variants.map((v) => (
          <VariantSamplesCard
            key={v.id}
            experimentId={experimentId}
            experimentReferenceCode={experimentReferenceCode}
            primarySubject={primarySubject}
            variant={v}
            samples={samples.filter((s) => s.experimentVariantId === v.id)}
            uoms={uoms}
            onFocus={(id, mode) => setFocused({ id, mode })}
          />
        ))}
      </div>
    </div>
  );
};

export default Samples;
