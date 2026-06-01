"use server";

import prisma from "@/lib/prisma";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";

type CreateAnalogInput = {
  experimentId: string;
  mbprId: string;
  label: string;
};

export const createExperimentVariantAnalog = async ({
  experimentId,
  mbprId,
  label,
}: CreateAnalogInput) => {
  const mbpr = await prisma.masterBatchProductionRecord.findUniqueOrThrow({
    where: { id: mbprId },
    include: {
      BillOfMaterial: { include: { step: true } },
      BatchStep: { include: { StepInstruction: true } },
    },
  });

  // Order BOM lines by step.sequence then BOM createdAt so analogs land with
  // the same ordering the MBPR carries.
  const sortedBom = [...mbpr.BillOfMaterial].sort((a, b) => {
    if (a.step.sequence !== b.step.sequence) return a.step.sequence - b.step.sequence;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Flatten the MBPR's step instructions into an ordered method: walk active
  // steps in sequence order and emit one method step per active instruction,
  // tagging each with its step's phase.
  const activeSteps = [...mbpr.BatchStep]
    .filter((s) => s.recordStatusId !== recordStatuses.archived)
    .sort((a, b) => a.sequence - b.sequence);

  const methodStepData: {
    experimentVariantId: string;
    sequence: number;
    phase: string | null;
    content: string;
  }[] = [];

  return prisma.$transaction(async (tx) => {
    const variant = await tx.experimentVariant.create({
      data: { experimentId, label },
    });

    if (sortedBom.length > 0) {
      await tx.experimentVariantMaterial.createMany({
        data: sortedBom.map((bom, i) => ({
          experimentVariantId: variant.id,
          itemId: bom.itemId,
          concentration: bom.concentration / 100,
          sequence: i,
          phase: bom.step.phase || null,
        })),
        skipDuplicates: true,
      });
    }

    for (const step of activeSteps) {
      const instructions = step.StepInstruction.filter(
        (i) => i.recordStatusId !== recordStatuses.archived,
      );
      for (const instruction of instructions) {
        methodStepData.push({
          experimentVariantId: variant.id,
          sequence: methodStepData.length,
          phase: step.phase || null,
          content: instruction.instructionContent,
        });
      }
    }

    if (methodStepData.length > 0) {
      await tx.experimentVariantMethodStep.createMany({ data: methodStepData });
    }

    return variant;
  });
};
