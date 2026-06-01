"use server";

import prisma from "@/lib/prisma";
import { buildSampleContext } from "@/utils/research/llmContext";
import { getAllMeasurementsBySample } from "../measurements/getAllBySample";
import { getAllSampleNotesBySample } from "../sampleNotes/getAllBySample";

export const getSampleContext = async (sampleId: string): Promise<string> => {
  const sample = await prisma.experimentSample.findUnique({
    where: { id: sampleId },
    include: {
      uom: true,
      experimentVariant: {
        include: {
          materials: { include: { item: true }, orderBy: { sequence: "asc" } },
          methodSteps: { orderBy: { sequence: "asc" } },
        },
      },
      experiment: {
        include: {
          status: true,
          primaryInvestigator: true,
          primarySubject: true,
        },
      },
    },
  });

  if (!sample) throw new Error("Sample not found");

  const [measurements, notes] = await Promise.all([
    getAllMeasurementsBySample(sample.id),
    getAllSampleNotesBySample(sample.id),
  ]);

  return buildSampleContext({
    experiment: sample.experiment,
    variant: sample.experimentVariant,
    sample,
    measurements,
    notes,
  });
};
