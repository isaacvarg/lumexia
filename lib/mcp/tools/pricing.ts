import { z } from "zod";
import prisma from "@/lib/prisma";
import { getItemPricingData } from "@/actions/accounting/pricing/getItemPricingData";
import { getLastItemPrice } from "@/actions/accounting/pricing/getLastItemPrice";
import { getItemCost } from "@/app/accounting/pricing/_calculations/getItemCost";
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
const round = (n: number) => Math.round(n * 1e4) / 1e4;

const examStatusKeys = Object.keys(pricingExaminationStatuses) as [
  keyof typeof pricingExaminationStatuses,
  ...(keyof typeof pricingExaminationStatuses)[],
];

const itemSelect = { select: { id: true, name: true, referenceCode: true } } as const;

// The stored figures of a finished product (live or archived in an examination).
const describeFinishedProduct = (fp: {
  name: string;
  fillQuantity: number;
  declaredQuantity: number;
  fillUom: { abbreviation: string };
  productFillCost: number;
  auxiliariesTotalCost: number;
  difficultyAdjustmentCost: number;
  freeShippingCost: number;
  finishedProductTotalCost: number;
  consumerPrice: number;
  markup: number;
  profit: number;
  profitPercentage: number;
}) => ({
  name: fp.name,
  fillQuantity: fp.fillQuantity,
  declaredQuantity: fp.declaredQuantity,
  fillUom: fp.fillUom.abbreviation,
  productFillCost: fp.productFillCost,
  auxiliariesTotalCost: fp.auxiliariesTotalCost,
  difficultyAdjustmentCost: fp.difficultyAdjustmentCost,
  freeShippingCost: fp.freeShippingCost,
  totalCost: fp.finishedProductTotalCost,
  consumerPrice: fp.consumerPrice,
  // a currency amount (consumer price minus total cost), as the pricing screens show it
  markup: fp.markup,
  profit: fp.profit,
  profitPercent: fp.profitPercentage,
});

const finishedProductFields = {
  name: true,
  fillQuantity: true,
  declaredQuantity: true,
  fillUom: { select: { abbreviation: true } },
  productFillCost: true,
  auxiliariesTotalCost: true,
  difficultyAdjustmentCost: true,
  freeShippingCost: true,
  finishedProductTotalCost: true,
  consumerPrice: true,
  markup: true,
  profit: true,
  profitPercentage: true,
} as const;

const describePricingData = (data: {
  arrivalCost: number;
  unforeseenDifficultiesCost: number;
  productionUsageCost: number;
  auxiliaryUsageCost: number;
  isUpcomingPriceActive: boolean;
  upcomingPrice: number;
  upcomingPriceUom: { abbreviation: string };
  overallItemCost: number;
}) => ({
  arrivalCost: data.arrivalCost,
  unforeseenDifficultiesCost: data.unforeseenDifficultiesCost,
  productionUsageCost: data.productionUsageCost,
  auxiliaryUsageCost: data.auxiliaryUsageCost,
  upcomingPrice: data.upcomingPrice,
  upcomingPriceUom: data.upcomingPriceUom.abbreviation,
  upcomingPriceActive: data.isUpcomingPriceActive,
  overallItemCost: data.overallItemCost,
});

const examSummarySelect = {
  id: true,
  createdAt: true,
  approvedAt: true,
  rejectedAt: true,
  examinedItem: itemSelect,
  status: { select: { name: true } },
  user: { select: { name: true } },
  approvedBy: { select: { name: true } },
  rejectedBy: { select: { name: true } },
  FinishedProductArchive: { select: { name: true, consumerPrice: true, profitPercentage: true } },
} as const;

const describeExamSummary = (exam: {
  id: string;
  createdAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  examinedItem: { id: string; name: string; referenceCode: string };
  status: { name: string } | null;
  user: { name: string | null };
  approvedBy: { name: string | null } | null;
  rejectedBy: { name: string | null } | null;
  FinishedProductArchive: { name: string; consumerPrice: number; profitPercentage: number }[];
}) => ({
  id: exam.id,
  item: exam.examinedItem,
  status: exam.status?.name ?? null,
  examinedBy: exam.user.name,
  created: day(exam.createdAt),
  approved: exam.approvedAt ? { by: exam.approvedBy?.name ?? null, at: day(exam.approvedAt) } : null,
  rejected: exam.rejectedAt ? { by: exam.rejectedBy?.name ?? null, at: day(exam.rejectedAt) } : null,
  finishedProducts: exam.FinishedProductArchive.map((fp) => ({
    name: fp.name,
    consumerPrice: fp.consumerPrice,
    profitPercent: fp.profitPercentage,
  })),
});

export const registerPricingTools: ToolRegistrar = (server) => {
  server.registerTool(
    "get_item_pricing",
    {
      title: "Get item pricing",
      description:
        "An item's current pricing: its pricing data (arrival, unforeseen-difficulties, usage costs, upcoming price), " +
        "the last purchase price, the resulting item cost (price per unit + arrival + unforeseen difficulties), the " +
        "finished products filled with it (fill, costs, consumer price, markup, profit), and its latest examinations. " +
        "Figures are as stored by the last pricing examination.",
      inputSchema: { item: z.string().min(1).describe("Item id or reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);

      const [details, pricingData, lastPrice, finishedProducts, examinations] = await Promise.all([
        prisma.item.findUniqueOrThrow({
          where: { id: item.id },
          select: { procurementType: { select: { name: true } }, itemType: { select: { name: true } } },
        }),
        getItemPricingData(item.id),
        getLastItemPrice(item.id),
        prisma.finishedProduct.findMany({
          where: { filledWithItemId: item.id, recordStatusId: { not: recordStatuses.archived } },
          select: {
            ...finishedProductFields,
            auxiliaries: {
              where: { recordStatusId: recordStatuses.active },
              select: { quantity: true, difficultyAdjustmentCost: true, auxiliaryItem: itemSelect },
            },
          },
          orderBy: { name: "asc" },
        }),
        prisma.pricingExamination.findMany({
          where: { examinedItemId: item.id },
          select: examSummarySelect,
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      // getItemCost throws when the data can't produce a cost; report why instead.
      let itemCost: number | null = null;
      let itemCostProblem: string | null = null;
      if (!pricingData) itemCostProblem = "No pricing data recorded for this item.";
      else {
        try {
          itemCost = round(getItemCost(pricingData, lastPrice));
        } catch (error) {
          itemCostProblem = error instanceof Error ? error.message : String(error);
        }
      }

      return jsonResult({
        item: { ...item, type: details.itemType.name, procurement: details.procurementType.name },
        pricingData: pricingData && describePricingData(pricingData),
        lastPurchase: lastPrice && {
          purchaseOrder: lastPrice.purchaseOrders.referenceCode,
          ordered: day(lastPrice.createdAt),
          pricePerUnit: lastPrice.pricePerUnit,
          uom: lastPrice.uom.abbreviation,
        },
        itemCost,
        itemCostSource: pricingData?.isUpcomingPriceActive ? "upcoming price" : "last purchase price",
        itemCostProblem,
        finishedProducts: finishedProducts.map((fp) => ({
          ...describeFinishedProduct(fp),
          auxiliaries: fp.auxiliaries.map((a) => ({
            item: a.auxiliaryItem,
            quantity: a.quantity,
            difficultyAdjustmentCost: a.difficultyAdjustmentCost,
          })),
        })),
        recentExaminations: examinations.map(describeExamSummary),
      });
    },
  );

  server.registerTool(
    "search_pricing_examinations",
    {
      title: "Search pricing examinations",
      description:
        "Pricing examinations, newest first: item, status, who examined, approved or rejected it, and the consumer " +
        "price and profit of each finished product. Filter by item or status, e.g. pendingReview for the review " +
        "queue or queued for items waiting to be examined.",
      inputSchema: {
        item: z.string().optional().describe("Item id or reference code"),
        status: z.array(z.enum(examStatusKeys)).optional(),
        limit: z.number().int().min(1).max(100).optional().describe("Max examinations (default 25)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier, status, limit }) => {
      const item = identifier ? await findItem(identifier) : null;
      if (identifier && !item) return errorResult(`No item found for "${identifier}". Try search_items.`);

      const exams = await prisma.pricingExamination.findMany({
        where: {
          examinedItemId: item?.id,
          statusId: status ? { in: status.map((s) => pricingExaminationStatuses[s]) } : undefined,
        },
        select: examSummarySelect,
        orderBy: { createdAt: "desc" },
        take: limit ?? 25,
      });

      return jsonResult(exams.map(describeExamSummary));
    },
  );

  server.registerTool(
    "get_pricing_examination",
    {
      title: "Get pricing examination",
      description:
        "One pricing examination by id, as snapshotted when it was done: the item's pricing data, finished products " +
        "with costs, consumer price, markup and profit, consumer containers, and for produced items the batch costing " +
        "(MBPR, batch size, vessel, cost per batch and per lb) with every BOM material's price and where it came from. " +
        "Includes validation, notes, and the examination it replaced after a rejection.",
      inputSchema: { id: z.string().uuid().describe("Examination id, from search_pricing_examinations or get_item_pricing") },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      const exam = await prisma.pricingExamination.findUnique({
        where: { id },
        select: {
          ...examSummarySelect,
          rejectedFromId: true,
          replacedBy: { select: { id: true } },
          examinedItem: { select: { ...itemSelect.select, procurementType: { select: { name: true } } } },
          itemPricingDataArchive: {
            select: {
              arrivalCost: true,
              unforeseenDifficultiesCost: true,
              productionUsageCost: true,
              auxiliaryUsageCost: true,
              isUpcomingPriceActive: true,
              upcomingPrice: true,
              upcomingPriceUom: { select: { abbreviation: true } },
              overallItemCost: true,
            },
            take: 1,
          },
          FinishedProductArchive: { select: finishedProductFields, orderBy: { name: "asc" } },
          consumerContainerArchive: {
            select: {
              containerCost: true,
              fillLaborCost: true,
              shippingCost: true,
              freeShippingCost: true,
              containerItem: itemSelect,
              ItemConsumerContainerArchive: {
                select: {
                  fillQuantity: true,
                  declaredQuantity: true,
                  difficultiesCost: true,
                  consumerPrice: true,
                  uom: { select: { abbreviation: true } },
                },
              },
            },
          },
          producedPricingDataArchives: {
            select: {
              mbprVersionLabel: true,
              batchSizeQuantity: true,
              compoundingVesselEquipmentName: true,
              compoundingTankTime: true,
              bomCount: true,
              totalBomCostPerBatch: true,
              totalBomCostPerLb: true,
              totalCostPerBatch: true,
              totalCostPerLb: true,
              bomPricingDataArchives: {
                select: {
                  item: itemSelect,
                  materialPrice: true,
                  materialPriceOrigin: true,
                  upcomingPriceUsed: true,
                  upcomingPriceUom: { select: { abbreviation: true } },
                  arrivalCost: true,
                  unforeseenDifficultiesCost: true,
                  productionUsageCost: true,
                  totalMaterialCost: true,
                  overallItemCostPerLb: true,
                  overallItemCostPerBatch: true,
                },
                orderBy: { overallItemCostPerBatch: "desc" },
              },
            },
          },
          validation: {
            select: { allContainersReviewed: true, allContainersExceedProfitThreshold: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          PricingExaminationNote: {
            select: { content: true, createdAt: true, user: { select: { name: true } }, noteType: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!exam) return errorResult(`No pricing examination with id ${id}. Try search_pricing_examinations.`);

      const pricingData = exam.itemPricingDataArchive[0];
      const validation = exam.validation[0];
      const { procurementType, ...examinedItem } = exam.examinedItem;

      return jsonResult({
        ...describeExamSummary({ ...exam, examinedItem }),
        procurement: procurementType.name,
        replacesRejected: exam.rejectedFromId,
        replacedBy: exam.replacedBy.map((e) => e.id),
        pricingData: pricingData && describePricingData(pricingData),
        finishedProducts: exam.FinishedProductArchive.map(describeFinishedProduct),
        consumerContainers: exam.consumerContainerArchive.map((c) => ({
          container: c.containerItem,
          containerCost: c.containerCost,
          fillLaborCost: c.fillLaborCost,
          shippingCost: c.shippingCost,
          freeShippingCost: c.freeShippingCost,
          fills: c.ItemConsumerContainerArchive.map((f) => ({
            fillQuantity: f.fillQuantity,
            declaredQuantity: f.declaredQuantity,
            uom: f.uom.abbreviation,
            difficultiesCost: f.difficultiesCost,
            consumerPrice: f.consumerPrice,
          })),
        })),
        batchCosting: exam.producedPricingDataArchives.map((p) => ({
          mbprVersion: p.mbprVersionLabel,
          batchSize: p.batchSizeQuantity,
          compoundingVessel: p.compoundingVesselEquipmentName,
          compoundingTankTime: p.compoundingTankTime,
          bomCount: p.bomCount,
          bomCostPerBatch: p.totalBomCostPerBatch,
          bomCostPerLb: p.totalBomCostPerLb,
          totalCostPerBatch: p.totalCostPerBatch,
          totalCostPerLb: p.totalCostPerLb,
          materials: p.bomPricingDataArchives.map((m) => ({
            item: m.item,
            price: m.materialPrice,
            priceFrom: m.materialPriceOrigin,
            upcomingPriceUsed: m.upcomingPriceUsed,
            priceUom: m.upcomingPriceUom.abbreviation,
            arrivalCost: m.arrivalCost,
            unforeseenDifficultiesCost: m.unforeseenDifficultiesCost,
            productionUsageCost: m.productionUsageCost,
            totalMaterialCost: m.totalMaterialCost,
            costPerLb: m.overallItemCostPerLb,
            costPerBatch: m.overallItemCostPerBatch,
          })),
        })),
        validation: validation && {
          allContainersReviewed: validation.allContainersReviewed,
          allContainersExceedProfitThreshold: validation.allContainersExceedProfitThreshold,
        },
        notes: exam.PricingExaminationNote.map((n) => ({ type: n.noteType.name, content: n.content, by: n.user.name, at: n.createdAt })),
      });
    },
  );
};
