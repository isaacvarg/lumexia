"use server";

import prisma from "@/lib/prisma";

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
    },
  });

  // Order BOM lines by step.sequence then BOM createdAt so analogs land with
  // the same ordering the MBPR carries.
  const sortedBom = [...mbpr.BillOfMaterial].sort((a, b) => {
    if (a.step.sequence !== b.step.sequence) return a.step.sequence - b.step.sequence;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

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

    return variant;
  });
};
