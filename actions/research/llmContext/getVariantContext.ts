"use server";

import prisma from "@/lib/prisma";
import { buildVariantContext, MeasurementInput, NoteInput } from "@/utils/research/llmContext";
import { getAllMeasurementsBySample } from "../measurements/getAllBySample";
import { getAllSampleNotesBySample } from "../sampleNotes/getAllBySample";

export const getVariantContext = async (variantId: string): Promise<string> => {
  const variant = await prisma.experimentVariant.findUnique({
    where: { id: variantId },
    include: {
      materials: { include: { item: true }, orderBy: { sequence: "asc" } },
      methodSteps: { orderBy: { sequence: "asc" } },
      experiment: {
        include: {
          status: true,
          primaryInvestigator: true,
          primarySubject: true,
        },
      },
      samples: {
        include: { uom: true },
        orderBy: { referenceCode: "asc" },
      },
    },
  });

  if (!variant) throw new Error("Variant not found");

  const measurementsBySampleId: Record<string, MeasurementInput[]> = {};
  const notesBySampleId: Record<string, NoteInput[]> = {};

  await Promise.all(
    variant.samples.map(async (sample) => {
      const [measurements, notes] = await Promise.all([
        getAllMeasurementsBySample(sample.id),
        getAllSampleNotesBySample(sample.id),
      ]);
      measurementsBySampleId[sample.id] = measurements;
      notesBySampleId[sample.id] = notes;
    }),
  );

  return buildVariantContext({
    experiment: variant.experiment,
    variant,
    samples: variant.samples,
    measurementsBySampleId,
    notesBySampleId,
  });
};
