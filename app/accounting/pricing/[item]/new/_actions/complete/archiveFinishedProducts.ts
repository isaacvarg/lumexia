'use server'

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { InterimFinishedProductDetails, InterimAuxiliaryDetails, ProcessedFinishedProduct } from "@/store/pricingSharedSlice"

type Client = Prisma.TransactionClient | typeof prisma

export const archiveFinishedProducts = async (
  examinationId: string,
  finishedProducts: any[],
  processedData: Record<string, ProcessedFinishedProduct>,
  interimData: Record<string, any>,
  totalCostPerLb: number,
  client: Client = prisma,
) => {
  for (const fp of finishedProducts) {
    const processed = processedData[fp.id];
    const interim = interimData[fp.id] as InterimFinishedProductDetails | undefined;

    const name = interim?.name || fp.name;
    const fillQuantity = interim?.fillQuantity || fp.fillQuantity;
    const declaredQuantity = interim?.declaredQuantity || fp.declaredQuantity;
    const freeShippingCost = interim?.freeShippingCost || fp.freeShippingCost;
    const difficultyAdjustmentCost = interim?.difficultyAdjustmentCost || fp.difficultyAdjustmentCost;

    const productFillCost = fillQuantity * totalCostPerLb;

    let auxiliariesTotalCost = 0;
    const auxiliaryArchivesData = [];

    const auxiliariesBreakdown = fp.auxiliaries?.breakdown || [];
    for (const aux of auxiliariesBreakdown) {
      const interimAux = interimData[aux.auxiliaryId] as InterimAuxiliaryDetails | undefined;
      const quantity = interimAux?.quantity || aux.quantity;
      const auxDiffCost = interimAux?.difficultyAdjustmentCost || aux.difficultyAdjustmentCost;

      const ipd = await client.itemPricingData.findFirst({
        where: { itemId: aux.auxiliaryItemId }
      });

      const auxCost = (ipd?.overallItemCost || 0) * quantity + auxDiffCost;
      auxiliariesTotalCost += auxCost;

      auxiliaryArchivesData.push({
        apartOfFinishedProductId: fp.id,
        auxiliaryItemId: aux.auxiliaryItemId,
        quantity,
        difficultyAdjustmentCost: auxDiffCost,
        ipdArrivalCost: ipd?.arrivalCost || 0,
        ipdProductionUsageCost: ipd?.productionUsageCost || 0,
        ipdAuxiliaryUsageCost: ipd?.auxiliaryUsageCost || 0,
        ipdUnforeseenDifficultiesCost: ipd?.unforeseenDifficultiesCost || 0,
        ipdUpcomingPrice: ipd?.upcomingPrice || 0,
        ipdUpcomingPriceUomId: ipd?.upcomingPriceUomId || (await client.item.findUnique({ where: { id: aux.auxiliaryItemId } }))?.inventoryUomId || '',
        ipdIsUpcomingPriceActive: ipd?.isUpcomingPriceActive || false,
      });

      await client.finishedProductAuxiliary.update({
        where: { id: aux.auxiliaryId },
        data: {
          quantity,
          difficultyAdjustmentCost: auxDiffCost
        }
      });
    }

    const finishedProductTotalCost = productFillCost + auxiliariesTotalCost + difficultyAdjustmentCost + freeShippingCost;

    const fpArchive = await client.finishedProductArchive.create({
      data: {
        pricingExaminationId: examinationId,
        currentFinishedProductId: fp.id,
        name,
        filledWithItemId: fp.filledWithItemId,
        fillQuantity,
        declaredQuantity,
        freeShippingCost,
        fillUomId: fp.fillUomId,
        difficultyAdjustmentCost,
        finishedProductTotalCost,
        auxiliariesTotalCost,
        productFillCost,
        consumerPrice: processed ? processed.consumerPrice : fp.consumerPrice,
        markup: processed ? processed.markup : fp.markup,
        profit: processed ? processed.profit : fp.profit,
        profitPercentage: processed ? processed.profitPercentage : fp.profitPercentage,
      }
    });

    for (const auxData of auxiliaryArchivesData) {
      await client.finishedProductAuxiliaryArchive.create({
        data: auxData
      });
    }

    await client.finishedProductAuxiliary.updateMany({
      where: { apartOfFinishedProductId: fp.id },
      data: { finishedProductArchiveId: fpArchive.id }
    });

    await client.finishedProduct.update({
      where: { id: fp.id },
      data: {
        name,
        fillQuantity,
        declaredQuantity,
        freeShippingCost,
        difficultyAdjustmentCost,
        finishedProductTotalCost,
        auxiliariesTotalCost,
        productFillCost,
        consumerPrice: processed ? processed.consumerPrice : fp.consumerPrice,
        markup: processed ? processed.markup : fp.markup,
        profit: processed ? processed.profit : fp.profit,
        profitPercentage: processed ? processed.profitPercentage : fp.profitPercentage,
      }
    });
  }
}
