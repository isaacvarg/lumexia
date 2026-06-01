// Builds ready-to-paste, LLM-framed markdown summaries of R&D experiment data so an
// investigator can drop the context into a chat with an external LLM (Claude, Gemini, etc.)
// and have it act as a cosmetic chemist / formulator. Pure functions — safe to import on
// both the server (server actions) and the client.

import { fractionToPercent } from "@/utils/general/concentration";
import { groupVariantMaterialsByPhase } from "@/utils/general/groupVariantMaterials";
import { DateTime } from "luxon";

export const LLM_PREAMBLE = `You are an expert cosmetic chemist and formulator. I'm an investigator working in an R&D experiment tracker, and I'm pasting the context of a cosmetic formulation experiment below. Please act as my formulation partner: help me reason about the formulation, ingredient compatibility, phase behavior, emulsion/system stability, preservation, pH, viscosity, and any QC results, and suggest improvements or troubleshooting ideas.

Notes on the data:
- Ingredient concentrations are %w/w of the total formula.
- "Variants" are distinct formulations; "Samples" are physical batches made from a variant.
- QC measurements may include multiple runs of the same parameter.

Experiment context follows:`;

export const formatExpRef = (code: number) => `EXP-${String(code).padStart(4, "0")}`;
export const formatSampleRef = (code: number) => `S-${String(code).padStart(2, "0")}`;

// ---- Structural input types (kept minimal so both client props and server-fetched
// Prisma payloads satisfy them) ----

type MaterialInput = {
  item: { name: string };
  concentration: number;
  phase: string | null;
  sequence: number;
};

type MethodStepInput = {
  sequence: number;
  phase: string | null;
  content: string;
};

export type VariantInput = {
  id: string;
  label: string;
  materials: MaterialInput[];
  methodSteps: MethodStepInput[];
};

export type ExperimentInput = {
  referenceCode: number;
  objective: string | null;
  hypothesis: string | null;
  status: { name: string };
  primaryInvestigator: { name: string | null };
  primarySubject: { name: string };
};

export type SampleInput = {
  id: string;
  referenceCode: number;
  label: string;
  size: number | null;
  uom: { abbreviation: string } | null;
  preparedAt: Date | null;
  experimentVariantId: string;
};

export type MeasurementInput = {
  qcParameter: { name: string; uom: string };
  value: string;
  runNumber: number;
};

export type NoteInput = {
  content: string;
  noteType: { name: string };
  user: { name: string | null };
  createdAt: Date;
};

type AggregatedNoteInput =
  | { kind: "experiment"; note: NoteInput }
  | { kind: "sample"; sampleRef: number; sampleLabel: string; note: NoteInput };

const formatDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat("yyyy-LL-dd HH:mm");

// ---- Section formatters ----

export const formatVariantFormulation = (variant: VariantInput): string => {
  const lines: string[] = [];

  if (variant.materials.length === 0) {
    lines.push("_No ingredients defined._");
  } else {
    const { groups, orderedKeys } = groupVariantMaterialsByPhase(variant.materials);
    lines.push("| Ingredient | %w/w | Phase |");
    lines.push("| --- | --- | --- |");
    for (const key of orderedKeys) {
      const materials = groups.get(key) ?? [];
      for (const m of materials) {
        lines.push(
          `| ${m.item.name} | ${fractionToPercent(m.concentration)}% | ${key ?? "—"} |`,
        );
      }
    }
    const total = variant.materials.reduce((sum, m) => sum + m.concentration, 0);
    lines.push(`| **Total** | **${fractionToPercent(total)}%** | |`);
  }

  if (variant.methodSteps.length > 0) {
    lines.push("");
    lines.push("Method:");
    [...variant.methodSteps]
      .sort((a, b) => a.sequence - b.sequence)
      .forEach((step, i) => {
        const phase = step.phase ? `[${step.phase}] ` : "";
        lines.push(`${i + 1}. ${phase}${step.content}`);
      });
  }

  return lines.join("\n");
};

const sampleSizeText = (sample: SampleInput) =>
  sample.size != null && sample.uom
    ? `${sample.size} ${sample.uom.abbreviation}`
    : "unspecified size";

const sampleStatusText = (sample: SampleInput) =>
  sample.preparedAt ? `prepared ${formatDate(sample.preparedAt)}` : "not prepared";

export const formatSampleLine = (sample: SampleInput): string =>
  `- ${formatSampleRef(sample.referenceCode)} "${sample.label}" — ${sampleSizeText(sample)}, ${sampleStatusText(sample)}`;

export const formatMeasurements = (measurements: MeasurementInput[]): string => {
  if (measurements.length === 0) return "_No QC measurements recorded._";
  return measurements
    .map(
      (m) =>
        `- ${m.qcParameter.name}: ${m.value} ${m.qcParameter.uom} (run ${m.runNumber})`,
    )
    .join("\n");
};

export const formatNotes = (notes: NoteInput[]): string => {
  if (notes.length === 0) return "_No notes._";
  return notes
    .map(
      (n) =>
        `- [${n.noteType.name}] ${n.user.name ?? "Unknown"} (${formatDate(n.createdAt)}): ${n.content}`,
    )
    .join("\n");
};

const formatExperimentMeta = (experiment: ExperimentInput): string =>
  [
    `# Experiment ${formatExpRef(experiment.referenceCode)}`,
    `- Subject: ${experiment.primarySubject.name}`,
    `- Investigator: ${experiment.primaryInvestigator.name ?? "—"}`,
    `- Status: ${experiment.status.name}`,
    `- Objective: ${experiment.objective?.trim() || "—"}`,
    `- Hypothesis: ${experiment.hypothesis?.trim() || "—"}`,
  ].join("\n");

// ---- Top-level builders ----

export const buildExperimentContext = ({
  experiment,
  variants,
  samples,
  noteEntries,
}: {
  experiment: ExperimentInput;
  variants: VariantInput[];
  samples: SampleInput[];
  noteEntries: AggregatedNoteInput[];
}): string => {
  const sections: string[] = [LLM_PREAMBLE, formatExperimentMeta(experiment)];

  sections.push("## Variants & Formulations");
  if (variants.length === 0) {
    sections.push("_No variants defined._");
  } else {
    for (const variant of variants) {
      const variantSamples = samples.filter(
        (s) => s.experimentVariantId === variant.id,
      );
      const block = [`### ${variant.label}`, formatVariantFormulation(variant)];
      if (variantSamples.length > 0) {
        block.push("");
        block.push("Samples:");
        block.push(variantSamples.map(formatSampleLine).join("\n"));
      }
      sections.push(block.join("\n"));
    }
  }

  sections.push(
    ["## Notes & Comments", formatNotes(noteEntries.map((e) => e.note))].join("\n"),
  );

  return sections.join("\n\n");
};

export const buildVariantContext = ({
  experiment,
  variant,
  samples,
  measurementsBySampleId,
  notesBySampleId,
}: {
  experiment: ExperimentInput;
  variant: VariantInput;
  samples: SampleInput[];
  measurementsBySampleId: Record<string, MeasurementInput[]>;
  notesBySampleId: Record<string, NoteInput[]>;
}): string => {
  const sections: string[] = [
    LLM_PREAMBLE,
    formatExperimentMeta(experiment),
    [`## Variant ${variant.label}`, formatVariantFormulation(variant)].join("\n"),
  ];

  if (samples.length === 0) {
    sections.push("## Samples\n_No samples made from this variant yet._");
  } else {
    for (const sample of samples) {
      const block = [
        `## Sample ${formatSampleRef(sample.referenceCode)} — ${sample.label}`,
        formatSampleLine(sample),
        "",
        "QC Measurements:",
        formatMeasurements(measurementsBySampleId[sample.id] ?? []),
        "",
        "Sample Notes:",
        formatNotes(notesBySampleId[sample.id] ?? []),
      ];
      sections.push(block.join("\n"));
    }
  }

  return sections.join("\n\n");
};

export const buildSampleContext = ({
  experiment,
  variant,
  sample,
  measurements,
  notes,
}: {
  experiment: ExperimentInput;
  variant: VariantInput;
  sample: SampleInput;
  measurements: MeasurementInput[];
  notes: NoteInput[];
}): string =>
  [
    LLM_PREAMBLE,
    formatExperimentMeta(experiment),
    [
      `## Formulation (variant ${variant.label})`,
      formatVariantFormulation(variant),
    ].join("\n"),
    [
      `## Sample ${formatSampleRef(sample.referenceCode)} — ${sample.label}`,
      formatSampleLine(sample),
    ].join("\n"),
    ["## QC Measurements", formatMeasurements(measurements)].join("\n"),
    ["## Sample Notes", formatNotes(notes)].join("\n"),
  ].join("\n\n");
