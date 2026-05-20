'use server'

import { ItemPricingData } from "@/actions/accounting/pricing/getItemPricingData"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type Client = Prisma.TransactionClient | typeof prisma

export const archiveItemPricingData = async (
  examinationId: string,
  pricingData: ItemPricingData,
  client: Client = prisma,
) => {
  if (!pricingData) return;

  await client.itemPricingDataArchive.create({
    data: {
      examinationId,
      currentItemPricingDataId: pricingData.id,
      arrivalCost: pricingData.arrivalCost,
      productionUsageCost: pricingData.productionUsageCost,
      auxiliaryUsageCost: pricingData.auxiliaryUsageCost,
      unforeseenDifficultiesCost: pricingData.unforeseenDifficultiesCost,
      isUpcomingPriceActive: pricingData.isUpcomingPriceActive,
      upcomingPrice: pricingData.upcomingPrice,
      upcomingPriceUomId: pricingData.upcomingPriceUomId,
      overallItemCost: pricingData.overallItemCost,
    }
  })
}
