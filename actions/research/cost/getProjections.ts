"use server";

import prisma from "@/lib/prisma";
import { getOneExperiment } from "../getOneExperiment";
import { getAllVariantsByExperiment } from "../variants/getAllByExperiment";
import { getAllCostBatchSizes } from "../costBatchSizes/getAll";
import { getCostSettings } from "../costSettings/get";
import { getLastItemPrice } from "@/actions/accounting/pricing/getLastItemPrice";
import { getItemPricingData } from "@/actions/accounting/pricing/getItemPricingData";
import { getTotalCostPerLbPurchased } from "@/app/accounting/pricing/[item]/new/_calculations/getTotalCostPerLbPurchased";

// Resolve a material's purchased cost per lb, returning null when no price is
// available (speculative projection — one unpriced material must not break the tab).
const resolveUnitCostPerLb = async (itemId: string): Promise<number | null> => {
  try {
    const [lastPurchase, pricingData] = await Promise.all([
      getLastItemPrice(itemId),
      getItemPricingData(itemId),
    ]);
    if (!pricingData) return null;
    return await getTotalCostPerLbPurchased(lastPurchase, pricingData);
  } catch {
    return null;
  }
};

// Latest produced pricing examination cost/lb for the experiment's primary subject.
const getLastExamCostPerLb = async (itemId: string): Promise<number | null> => {
  const exams = await prisma.pricingExamination.findMany({
    where: { examinedItemId: itemId },
    include: { producedPricingDataArchives: true },
    orderBy: { createdAt: "desc" },
  });
  const costed = exams.find((e) => e.producedPricingDataArchives.length > 0);
  return costed?.producedPricingDataArchives[0]?.totalCostPerLb ?? null;
};

export const getVariantCostProjections = async (experimentId: string) => {
  const [experiment, variants, batchSizes, settings] = await Promise.all([
    getOneExperiment(experimentId),
    getAllVariantsByExperiment(experimentId),
    getAllCostBatchSizes(),
    getCostSettings(),
  ]);

  const lastExamCostPerLb = experiment?.primarySubject?.id
    ? await getLastExamCostPerLb(experiment.primarySubject.id)
    : null;

  const variantProjections = await Promise.all(
    variants.map(async (variant) => {
      const materials = await Promise.all(
        variant.materials.map(async (m) => {
          const unitCostPerLb = await resolveUnitCostPerLb(m.itemId);
          const hasPrice = unitCostPerLb != null;
          const contribution = hasPrice ? m.concentration * unitCostPerLb : 0;
          return {
            id: m.id,
            itemName: m.item.name,
            concentrationPercent: m.concentration * 100,
            unitCostPerLb,
            contribution,
            hasPrice,
          };
        }),
      );

      const bomCostPerLb = materials.reduce((sum, m) => sum + m.contribution, 0);
      const projectedCostPerLb =
        bomCostPerLb * (1 + settings.overheadPercent / 100) + settings.overheadPerLb;
      const missingPriceCount = materials.filter((m) => !m.hasPrice).length;

      const perBatch = batchSizes.map((bs) => ({
        batchSizeId: bs.id,
        label: bs.label,
        quantityLb: bs.quantityLb,
        bomCost: bomCostPerLb * bs.quantityLb,
        projectedCost: projectedCostPerLb * bs.quantityLb,
      }));

      const delta =
        lastExamCostPerLb != null ? projectedCostPerLb - lastExamCostPerLb : null;

      return {
        id: variant.id,
        label: variant.label,
        bomCostPerLb,
        projectedCostPerLb,
        missingPriceCount,
        perBatch,
        delta,
        materials,
      };
    }),
  );

  return {
    batchSizes,
    settings,
    lastExamCostPerLb,
    variants: variantProjections,
  };
};

export type VariantCostProjections = Awaited<
  ReturnType<typeof getVariantCostProjections>
>;
export type VariantCostProjection = VariantCostProjections["variants"][number];
