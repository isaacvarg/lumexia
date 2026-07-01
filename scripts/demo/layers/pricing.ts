import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { addDays, chance, pick, randFloat, randInt, randomPastDate, sample, shuffle, stamp } from '../lib/timeline';
import { EXAMINATION_NOTES } from '../data/pricing';
import { DemoItem } from './items';
import { DemoUser } from './users';
import { DemoMbpr } from './mbprs';
import { DemoEquipment } from './equipment';
import { DemoItemPricingData } from './itemPricingData';
import { DemoFinishedProduct } from './appliedTemplates';

const poundsUom = () => (refs.uom as Record<string, string>).pounds;
const examStatus = (key: string) => (refs.pricingExaminationStatuses as Record<string, string>)[key];
const round2 = (n: number) => Math.round(n * 100) / 100;

const DRAFT_COUNT = 8;
const REVIEW_COUNT = 6;
const APPROVED_COUNT = 6;

const SELLABLE_PURCHASED_TYPES = new Set(['Merchandise', 'Tabletop', 'Cat Supplies']);

// seeds the pricing-examination side: examinations across draft (queued), needs-review
// (pendingReview) and approved, plus the archive snapshots hung off the reviewed/approved ones.
// Live pricing records are owned by earlier layers — this layer references them:
//   • ItemPricingData        → seedItemPricingData (one per item)
//   • FinishedProduct + aux  → seedAppliedTemplates (per produced/sellable item)
export const seedPricing = async (
  purchasedItems: DemoItem[],
  producedItems: DemoItem[],
  mbprs: DemoMbpr[],
  equipment: DemoEquipment[],
  packagingItems: DemoItem[],
  users: DemoUser[],
  ipdByItemId: Map<string, DemoItemPricingData>,
  fpByItemId: Map<string, DemoFinishedProduct[]>,
): Promise<void> => {
  const mbprByItemId = new Map(mbprs.map((m) => [m.producesItem.id, m]));
  const vessels = equipment.filter((e) => e.vesselId);
  const containerItem = packagingItems.find((i) => /cup|mug/i.test(i.name)) ?? packagingItems[0];
  const sellablePurchased = purchasedItems.filter((i) => SELLABLE_PURCHASED_TYPES.has(i.type));

  // row buckets (live records are seeded elsewhere; here we only build archives + exams)
  const examRows: any[] = [];
  const ipdArchiveRows: any[] = [];
  const producedArchiveRows: any[] = [];
  const bomArchiveRows: any[] = [];
  const fpArchiveRows: any[] = [];
  const fpAuxArchiveRows: any[] = [];
  const consumerContainerRows: any[] = [];
  const itemConsumerContainerRows: any[] = [];
  const ccArchiveRows: any[] = [];
  const iccArchiveRows: any[] = [];
  const validationRows: any[] = [];
  const noteRows: any[] = [];

  // distinct items for the three buckets (mix of produced + sellable-purchased — the
  // things a user actually examines; raw ingredients/supplies are inputs, not examined).
  const pool = shuffle([
    ...producedItems.map((i) => ({ item: i, produced: true })),
    ...sellablePurchased.map((i) => ({ item: i, produced: false })),
  ]);
  let cursor = 0;
  const take = (n: number) => pool.slice(cursor, (cursor += n));

  const drafts = take(DRAFT_COUNT);
  const reviews = take(REVIEW_COUNT);
  const approvals = take(APPROVED_COUNT);

  // ── draft (queued) examinations — bare rows ───────────────────────────────
  for (const { item } of drafts) {
    const createdAt = randomPastDate(1, 20);
    examRows.push({
      id: uuid(),
      statusId: examStatus('queued'),
      examinedItemId: item.id,
      userId: pick(users).id,
      ...stamp(createdAt),
    });
  }

  // builds a full examination (exam + archive tree) for review/approved, snapshotting the
  // live ItemPricingData / FinishedProduct records the earlier layers created.
  const buildFull = (item: DemoItem, produced: boolean, approved: boolean) => {
    const examId = uuid();
    const createdAt = randomPastDate(5, 90);
    const drafter = pick(users);
    const approvedAt = approved ? addDays(createdAt, randFloat(1, 8)) : null;
    const updatedAt = approvedAt ?? addDays(createdAt, randFloat(0.5, 5));

    // cost per lb of the examined item (drives finished-product fill cost)
    let costPerLb: number;

    if (produced) {
      const mbpr = mbprByItemId.get(item.id)!;
      const batchSize = pick(mbpr.batchSizes);
      const vessel = pick(vessels);
      const vesselEq = equipment.find((e) => e.vesselId === vessel.vesselId)!;
      const producedArchiveId = uuid();

      let totalBomCostPerBatch = 0;
      const lineRows = mbpr.bomLines.map((line) => {
        const materialPrice = randFloat(2, 40);
        const qtyPerBatch = batchSize.quantity * (line.concentration * 0.01);
        const totalMaterialCost = round2(materialPrice * qtyPerBatch);
        totalBomCostPerBatch += totalMaterialCost;
        const arrivalCost = randFloat(0.1, 1.5);
        const unforeseen = randFloat(0, 0.5);
        const productionUsage = randFloat(0, 0.8);
        return {
          id: uuid(),
          examinationId: examId,
          producedPricingDataArchiveId: producedArchiveId,
          bomId: line.id,
          itemId: line.itemId,
          totalMaterialCost,
          materialPrice,
          materialPriceOrigin: 'current',
          upcomingPriceUsed: false,
          upcomingPriceUomId: poundsUom(),
          arrivalCost,
          unforeseenDifficultiesCost: unforeseen,
          productionUsageCost: productionUsage,
          overallItemCostPerLb: round2(materialPrice + arrivalCost + unforeseen + productionUsage),
          overallItemCostPerBatch: round2((materialPrice + arrivalCost + unforeseen + productionUsage) * qtyPerBatch),
          ...stamp(createdAt, updatedAt),
        };
      });
      bomArchiveRows.push(...lineRows);

      const totalBomCostPerLb = round2(totalBomCostPerBatch / batchSize.quantity);
      const totalCostPerBatch = round2(totalBomCostPerBatch * randFloat(1.1, 1.35));
      const totalCostPerLb = round2(totalCostPerBatch / batchSize.quantity);
      costPerLb = totalCostPerLb;

      producedArchiveRows.push({
        id: producedArchiveId,
        examinationId: examId,
        mbprId: mbpr.id,
        mbprVersionLabel: mbpr.versionLabel,
        batchSizeId: batchSize.id,
        batchSizeQuantity: batchSize.quantity,
        compoundingVesselId: vessel.vesselId,
        compoundingVesselEquipmentName: vesselEq.name,
        compoundingTankTime: randFloat(15, 90),
        bomCount: mbpr.bomLines.length,
        totalBomCostPerBatch: round2(totalBomCostPerBatch),
        totalBomCostPerLb,
        totalCostPerBatch,
        totalCostPerLb,
        ...stamp(createdAt, updatedAt),
      });
    } else {
      // purchased — snapshot the item's live ItemPricingData (owned by seedItemPricingData)
      const ipd = ipdByItemId.get(item.id)!;
      costPerLb = ipd.overallItemCost;

      ipdArchiveRows.push({
        id: uuid(),
        examinationId: examId,
        currentItemPricingDataId: ipd.id,
        arrivalCost: ipd.arrivalCost,
        productionUsageCost: ipd.productionUsageCost,
        auxiliaryUsageCost: ipd.auxiliaryUsageCost,
        unforeseenDifficultiesCost: ipd.unforeseenDifficultiesCost,
        isUpcomingPriceActive: ipd.isUpcomingPriceActive,
        upcomingPrice: ipd.upcomingPrice,
        upcomingPriceUomId: ipd.upcomingPriceUomId,
        overallItemCost: ipd.overallItemCost,
        ...stamp(createdAt, updatedAt),
      });
    }

    // snapshot one of the item's live finished products (owned by seedAppliedTemplates)
    const liveFps = fpByItemId.get(item.id);
    if (liveFps && liveFps.length) {
      const fp = pick(liveFps);
      const productFillCost = round2(fp.fillQuantity * costPerLb);
      const auxiliariesTotalCost = round2(fp.auxiliaries.reduce((acc) => acc + randFloat(0.02, 0.08), 0));
      const finishedProductTotalCost = round2(productFillCost + auxiliariesTotalCost + fp.difficultyAdjustmentCost + fp.freeShippingCost);
      const consumerPrice = round2(finishedProductTotalCost * randFloat(1.6, 2.6));
      const markup = round2(consumerPrice - finishedProductTotalCost);
      const profitPercentage = consumerPrice ? round2((markup / consumerPrice) * 100) : 0;

      fpArchiveRows.push({
        id: uuid(),
        pricingExaminationId: examId,
        currentFinishedProductId: fp.id,
        name: fp.name,
        filledWithItemId: item.id,
        fillQuantity: fp.fillQuantity,
        declaredQuantity: fp.declaredQuantity,
        freeShippingCost: fp.freeShippingCost,
        fillUomId: poundsUom(),
        difficultyAdjustmentCost: fp.difficultyAdjustmentCost,
        finishedProductTotalCost,
        auxiliariesTotalCost,
        productFillCost,
        consumerPrice,
        markup,
        profit: markup,
        profitPercentage,
        ...stamp(createdAt, updatedAt),
      });

      for (const aux of fp.auxiliaries) {
        fpAuxArchiveRows.push({
          id: uuid(),
          apartOfFinishedProductId: fp.id,
          auxiliaryItemId: aux.auxiliaryItemId,
          quantity: aux.quantity,
          difficultyAdjustmentCost: aux.difficultyAdjustmentCost,
          ipdArrivalCost: randFloat(0.05, 0.5),
          ipdProductionUsageCost: randFloat(0, 0.3),
          ipdAuxiliaryUsageCost: randFloat(0, 0.3),
          ipdUnforeseenDifficultiesCost: randFloat(0, 0.2),
          ipdUpcomingPrice: 0,
          ipdUpcomingPriceUomId: poundsUom(),
          ipdIsUpcomingPriceActive: false,
          ...stamp(createdAt, updatedAt),
        });
      }
    }

    // consumer container (live + archive) + the item-in-container line
    const fillQuantity = randFloat(0.5, 1.2);
    const declaredQuantity = pick([8, 12, 16]);
    const consumerPrice = round2(fillQuantity * costPerLb * randFloat(1.6, 2.6));
    const ccId = uuid();
    const containerCost = randFloat(0.1, 0.6);
    const fillLaborCost = randFloat(0.05, 0.3);
    consumerContainerRows.push({
      id: ccId,
      containerItemId: containerItem.id,
      containerCost,
      fillLaborCost,
      freeShippingCost: 0,
      ...stamp(createdAt, updatedAt),
    });
    const iccId = uuid();
    const difficultiesCost = randFloat(0, 0.2);
    itemConsumerContainerRows.push({
      id: iccId,
      itemId: item.id,
      recordStatusId: refs.recordStatuses.active,
      consumerContainerId: ccId,
      fillQuantity,
      declaredQuantity,
      difficultiesCost,
      uomId: poundsUom(),
      consumerPrice,
      ...stamp(createdAt, updatedAt),
    });
    const ccArchiveId = uuid();
    ccArchiveRows.push({
      id: ccArchiveId,
      examinationId: examId,
      currentConsumerContaineId: ccId,
      containerItemId: containerItem.id,
      containerCost,
      fillLaborCost,
      shippingCost: randFloat(0, 0.3),
      freeShippingCost: 0,
      ...stamp(createdAt, updatedAt),
    });
    iccArchiveRows.push({
      id: uuid(),
      examinationId: examId,
      currentItemConsumerContainerId: iccId,
      consumerContainerArchiveId: ccArchiveId,
      fillQuantity,
      declaredQuantity,
      difficultiesCost,
      uomId: poundsUom(),
      consumerPrice,
      ...stamp(createdAt, updatedAt),
    });

    validationRows.push({
      id: uuid(),
      examinationId: examId,
      allContainersReviewed: true,
      allContainersExceedProfitThreshold: chance(0.8),
      ...stamp(createdAt, updatedAt),
    });

    for (const noteAt of sampleDates(createdAt, updatedAt)) {
      noteRows.push({
        id: uuid(),
        pricingExaminationId: examId,
        noteTypeId: refs.pricingExaminationNoteTypes.general,
        userId: drafter.id,
        content: pick(EXAMINATION_NOTES),
        ...stamp(noteAt),
      });
    }

    examRows.push({
      id: examId,
      statusId: approved ? examStatus('approved') : examStatus('pendingReview'),
      examinedItemId: item.id,
      userId: drafter.id,
      approvedById: approved ? pick(users).id : null,
      approvedAt,
      ...stamp(createdAt, updatedAt),
    });
  };

  for (const { item, produced } of reviews) buildFull(item, produced, false);
  for (const { item, produced } of approvals) buildFull(item, produced, true);

  // insert in FK-safe order (live consumer records → examinations → archives → validation/notes)
  await insert('consumerContainer', consumerContainerRows);
  await insert('itemConsumerContainer', itemConsumerContainerRows);
  await insert('pricingExamination', examRows);
  await insert('itemPricingDataArchive', ipdArchiveRows);
  await insert('producedPricingDataArchive', producedArchiveRows);
  await insert('bomPricingDataArchive', bomArchiveRows);
  await insert('finishedProductArchive', fpArchiveRows);
  await insert('finishedProductAuxiliaryArchive', fpAuxArchiveRows);
  await insert('consumerContainerArchive', ccArchiveRows);
  await insert('itemConsumerContainerArchive', iccArchiveRows);
  await insert('pricingExaminationValidation', validationRows);
  await insert('pricingExaminationNote', noteRows);
};

// 0–2 note timestamps between two dates
const sampleDates = (start: Date, end: Date): Date[] => {
  const count = chance(0.6) ? randInt(1, 2) : 0;
  const span = end.getTime() - start.getTime();
  return Array.from({ length: count }, () => new Date(start.getTime() + Math.random() * span));
};
