"use client";
import { SingleExperiment } from "@/actions/research/getOneExperiment";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { AggregatedNoteEntry } from "@/actions/research/experimentNotes/getAggregatedFeed";
import { buildExperimentContext } from "@/utils/research/llmContext";
import CopyForLlmButton from "./shared/CopyForLlmButton";

type Props = {
  experiment: SingleExperiment;
  variants: ExperimentVariantWithMaterials[];
  samples: ExperimentSampleRow[];
  noteEntries: AggregatedNoteEntry[];
};

const ExperimentCopyButton = ({
  experiment,
  variants,
  samples,
  noteEntries,
}: Props) => (
  <CopyForLlmButton
    tooltip="Copy whole experiment for an LLM"
    getText={() =>
      buildExperimentContext({ experiment, variants, samples, noteEntries })
    }
  />
);

export default ExperimentCopyButton;
