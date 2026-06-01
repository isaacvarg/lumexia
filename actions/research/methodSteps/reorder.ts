"use server";

import prisma from "@/lib/prisma";

type ReorderInput = {
  variantId: string;
  orderedIds: string[];
};

export const reorderVariantMethodSteps = async ({
  variantId,
  orderedIds,
}: ReorderInput) => {
  if (orderedIds.length === 0) return;

  // Belt-and-suspenders: ensure all ids belong to the variant.
  const owned = await prisma.experimentVariantMethodStep.findMany({
    where: { id: { in: orderedIds }, experimentVariantId: variantId },
    select: { id: true },
  });
  if (owned.length !== orderedIds.length) {
    throw new Error("Some method step ids do not belong to this variant");
  }

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.experimentVariantMethodStep.update({
        where: { id },
        data: { sequence: idx },
      }),
    ),
  );
};
