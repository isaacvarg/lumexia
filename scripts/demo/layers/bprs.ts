import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { addDays, chance, pick, productionSlot, randFloat, randInt, randomPastDate, spreadDates, stamp } from '../lib/timeline';
import { generateLotNumber } from '@/utils/lot/generateLotNumber';
import { BPR_NOTES, BPR_TRANSITION_REASONS } from '../data/production';
import { DemoUser } from './users';
import { DemoLot } from './purchaseOrders';
import { DemoMbpr } from './mbprs';

// An output lot produced by a BPR, surfaced so QC can examine recipe lots and link
// back to the originating batch. `isDone` marks lots from completed/awaitingQc batches
// (the ones that actually carry quantity and are worth examining).
export interface DemoBprLot {
  id: string;
  itemId: string;
  bprId: string;
  createdAt: Date;
  completedAt: Date | null;
  isDone: boolean;
}

// the BPR statuses the demo populates (the planning board ones)
const ALL_STATUSES = [
  'draft', 'queued', 'awaitingMaterials', 'knownMaterialArrival', 'allocatingMaterials',
  'stagingMaterials', 'verifyingBomFulfillment', 'compounding', 'completed', 'awaitingQc',
] as const;

// weighted pool for the remaining BPRs — emphasizes active/mid statuses
const STATUS_POOL = [
  'draft', 'draft', 'queued', 'queued', 'allocatingMaterials', 'awaitingMaterials',
  'knownMaterialArrival', 'stagingMaterials', 'stagingMaterials', 'verifyingBomFulfillment',
  'compounding', 'compounding', 'compounding', 'completed', 'completed', 'awaitingQc',
] as const;

// extra staging BPRs forced right after the first pass, so the staging board is
// reliably populated with mid-staging batches regardless of the random pool draw
const EXTRA_STAGING = 4;

// weighted per-line staging state for a mid-staging BPR — mostly pulled, some still
// outstanding, occasionally already primary-verified (see partial staging below)
const STAGING_LINE_POOL = [
  'pending', 'pending', 'staged', 'staged', 'staged', 'primaryVerified',
] as const;

// the linear path of statuses a batch passed through to reach each status
const PATHS: Record<string, string[]> = {
  draft: ['draft'],
  queued: ['draft', 'queued'],
  awaitingMaterials: ['draft', 'queued', 'awaitingMaterials'],
  knownMaterialArrival: ['draft', 'queued', 'awaitingMaterials', 'knownMaterialArrival'],
  allocatingMaterials: ['draft', 'queued', 'allocatingMaterials'],
  stagingMaterials: ['draft', 'queued', 'stagingMaterials'],
  verifyingBomFulfillment: ['draft', 'queued', 'stagingMaterials', 'verifyingBomFulfillment'],
  compounding: ['draft', 'queued', 'stagingMaterials', 'verifyingBomFulfillment', 'compounding'],
  completed: ['draft', 'queued', 'stagingMaterials', 'verifyingBomFulfillment', 'compounding', 'completed'],
  awaitingQc: ['draft', 'queued', 'stagingMaterials', 'verifyingBomFulfillment', 'compounding', 'completed', 'awaitingQc'],
};

const COMPOUNDING_PLUS = new Set(['compounding', 'completed', 'awaitingQc']);
const DONE_PLUS = new Set(['completed', 'awaitingQc']);

// actively-worked statuses that belong on the compounding weekly board — scheduled
// into a production slot (Mon–Thu) of this week or next so they surface there
const WINDOW_SCHEDULED = new Set(['compounding', 'stagingMaterials', 'verifyingBomFulfillment']);

const bprStatusId = (key: string): string => (refs.bprStatuses as Record<string, string>)[key];
const poundsUom = () => (refs.uom as Record<string, string>).pounds;
const clampPast = (date: Date): Date => new Date(Math.min(date.getTime(), Date.now() - 3_600_000));

// where each BPR line / step sits, derived from the BPR status
const bomLineStatusFor = (status: string): string => {
  if (COMPOUNDING_PLUS.has(status)) return 'consumed';
  if (status === 'verifyingBomFulfillment') return 'primaryVerified';
  if (status === 'allocatingMaterials' || status === 'stagingMaterials') return 'staged';
  return 'pending';
};

export const seedBprs = async (
  count: number,
  mbprs: DemoMbpr[],
  ingredientLots: DemoLot[],
  productionUsers: DemoUser[],
): Promise<DemoBprLot[]> => {
  const lotsByItem = new Map<string, DemoLot[]>();
  for (const lot of ingredientLots) {
    const list = lotsByItem.get(lot.itemId) ?? [];
    list.push(lot);
    lotsByItem.set(lot.itemId, list);
  }

  const bprRows: any[] = [];
  const lotRows: any[] = [];
  const lotOriginRows: any[] = [];
  const bprBomRows: any[] = [];
  const bprStepRows: any[] = [];
  const bprActionableRows: any[] = [];
  const transactionRows: any[] = [];
  const stagingRows: any[] = [];
  const consumptionRows: any[] = [];
  const transitionRows: any[] = [];
  const noteRows: any[] = [];
  const activityLogRows: any[] = [];
  const outputLots: DemoBprLot[] = [];

  for (let i = 0; i < count; i++) {
    // first pass guarantees one of every status; then a forced block of extra staging
    // BPRs; the rest are weighted
    const statusKey: string =
      i < ALL_STATUSES.length ? ALL_STATUSES[i]
        : i < ALL_STATUSES.length + EXTRA_STAGING ? 'stagingMaterials'
          : pick(STATUS_POOL);
    const mbpr = mbprs[i % mbprs.length];
    const batchSize = pick(mbpr.batchSizes);
    const user = pick(productionUsers);

    const compoundingPlus = COMPOUNDING_PLUS.has(statusKey);
    const donePlus = DONE_PLUS.has(statusKey);

    // per-line staging state. non-staging BPRs share one deterministic value; a
    // mid-staging BPR gets a realistic mix (some pulled, some outstanding), then we
    // nudge the result so it never comes out all-pending or all-staged
    const isStaging = statusKey === 'stagingMaterials';
    const lineStatuses: string[] = mbpr.bomLines.map(() =>
      isStaging ? pick(STAGING_LINE_POOL) : bomLineStatusFor(statusKey),
    );
    if (isStaging && lineStatuses.length > 0) {
      const pulled = lineStatuses.filter((s) => s !== 'pending').length;
      if (pulled === 0) lineStatuses[0] = 'staged';
      else if (pulled === lineStatuses.length && lineStatuses.length > 1) {
        lineStatuses[lineStatuses.length - 1] = 'pending';
      }
    }

    const createdAt = randomPastDate(1, 60);
    const completedAt = donePlus ? clampPast(addDays(createdAt, randFloat(1, 10))) : null;
    const updatedAt = completedAt ?? clampPast(addDays(createdAt, randFloat(0.5, 12)));
    const scheduledForStart = WINDOW_SCHEDULED.has(statusKey)
      ? productionSlot()
      : addDays(createdAt, randFloat(0, 3));
    const scheduledForEnd = addDays(scheduledForStart, randFloat(0.2, 1.5));

    const bprId = uuid();
    bprRows.push({
      id: bprId,
      mbprId: mbpr.id,
      bprStatusId: bprStatusId(statusKey),
      batchSizeId: batchSize.id,
      scheduledForStart,
      scheduledForEnd,
      completedAt,
      releasedAt: null,
      ...stamp(createdAt, updatedAt),
    });

    // output lot (filled once the batch is complete) + its batchProduction origin
    const outputLotId = uuid();
    lotRows.push({
      id: outputLotId,
      itemId: mbpr.producesItem.id,
      lotNumber: generateLotNumber(mbpr.producesItem.referenceCode, createdAt),
      initialQuantity: donePlus ? batchSize.quantity : 0,
      uomId: poundsUom(),
      ...stamp(donePlus ? (completedAt ?? createdAt) : createdAt),
    });
    lotOriginRows.push({
      id: uuid(),
      lotId: outputLotId,
      purchaseOrderId: null,
      bprId,
      originType: 'batchProduction',
      ...stamp(createdAt),
    });
    outputLots.push({
      id: outputLotId,
      itemId: mbpr.producesItem.id,
      bprId,
      createdAt,
      completedAt,
      isDone: donePlus,
    });

    // the two activity logs the UI cascade writes on BPR creation (createBpr.ts)
    activityLogRows.push(
      {
        id: uuid(),
        userId: user.id,
        action: 'Create BPR',
        entityType: 'bpr',
        entityId: bprId,
        details: { context: `BPR created for ${mbpr.producesItem.referenceCode}` },
        ...stamp(createdAt),
      },
      {
        id: uuid(),
        userId: user.id,
        action: 'Create Lot',
        entityType: 'lot',
        entityId: outputLotId,
        details: { context: `Lot was created from a batch of ${mbpr.producesItem.referenceCode}` },
        ...stamp(createdAt),
      },
    );

    // copy the recipe BOM into instance lines (qty = batch * concentration%)
    for (let li = 0; li < mbpr.bomLines.length; li++) {
      const line = mbpr.bomLines[li];
      const bomLineStatus = lineStatuses[li];
      const staged = bomLineStatus !== 'pending';
      const consume = bomLineStatus === 'consumed';
      const bprBomId = uuid();
      const quantity = batchSize.quantity * (line.concentration * 0.01);
      bprBomRows.push({
        id: bprBomId,
        bprId,
        bomId: line.id,
        quantity,
        uomId: poundsUom(),
        statusId: (refs.bprBomLineStatuses as Record<string, string>)[bomLineStatus],
        addedAt: createdAt,
        addedByUserId: user.id,
        ...stamp(createdAt, updatedAt),
      });

      // stage an actual ingredient lot once materials have been pulled
      if (staged) {
        const itemLots = lotsByItem.get(line.itemId);
        if (itemLots && itemLots.length > 0) {
          const lot = pick(itemLots);
          const stagingId = uuid();
          stagingRows.push({
            id: stagingId,
            bprBomId,
            lotId: lot.id,
            pulledByUserId: user.id,
            quantity,
            uomId: poundsUom(),
            bprStagingStatusId: (refs.bprStagingStatuses as Record<string, string>)[
              consume ? 'consumed' : bomLineStatus === 'primaryVerified' ? 'primaryVerified' : 'staged'
            ],
            ...stamp(createdAt, updatedAt),
          });

          // consumed materials produce a bprConsumption transaction
          if (consume) {
            const txId = uuid();
            transactionRows.push({
              id: txId,
              lotId: lot.id,
              transactionTypeId: refs.transactionTypes.bprConsumption,
              userId: user.id,
              uomId: poundsUom(),
              amount: quantity,
              systemNote: `BPR Consumption — staged against batch of ${mbpr.producesItem.referenceCode}.`,
              userNote: '',
              ...stamp(updatedAt),
            });
            consumptionRows.push({ id: uuid(), bprStagingId: stagingId, transactionId: txId, ...stamp(updatedAt) });
          }
        }
      }
    }

    // copy steps + their actionables into instance rows
    const stepStatusKey = donePlus ? 'completed' : compoundingPlus ? 'primaryVerification' : 'fulfillStep';
    const actionableStatusKey = donePlus ? 'completed' : compoundingPlus ? 'primaryVerification' : 'inProgress';
    for (const step of mbpr.steps) {
      const bprStepId = uuid();
      bprStepRows.push({
        id: bprStepId,
        batchStepId: step.id,
        bprId,
        completedAt: donePlus ? completedAt : null,
        statusId: (refs.bprBatchStepStatuses as Record<string, string>)[stepStatusKey],
        isComplete: donePlus,
        ...stamp(createdAt, updatedAt),
      });
      for (const actionableId of step.actionableIds) {
        bprActionableRows.push({
          id: uuid(),
          bprBatchStepId: bprStepId,
          batchStepActionableId: actionableId,
          statusId: (refs.bprStepActionableStatuses as Record<string, string>)[actionableStatusKey],
          isCompounded: compoundingPlus,
          isVerified: compoundingPlus,
          isSecondarilyVerified: donePlus,
          ...stamp(createdAt, updatedAt),
        });
      }
    }

    // status-transition history from draft up to the current status
    const path = PATHS[statusKey];
    const hopDates = spreadDates(createdAt, updatedAt, Math.max(path.length - 1, 0));
    for (let h = 0; h < path.length - 1; h++) {
      transitionRows.push({
        id: uuid(),
        bprId,
        fromStatusId: bprStatusId(path[h]),
        toStatusId: bprStatusId(path[h + 1]),
        kind: 'manual',
        event: `${path[h]} → ${path[h + 1]}`,
        userId: user.id,
        reason: pick(BPR_TRANSITION_REASONS),
        ...stamp(hopDates[h] ?? updatedAt),
      });
    }

    // a note or two; an error note for the troubled batches
    for (const noteAt of spreadDates(createdAt, updatedAt, chance(0.6) ? randInt(1, 2) : 0)) {
      noteRows.push({
        id: uuid(),
        bprId,
        noteTypeId: refs.bprNoteTypes.general,
        userId: user.id,
        content: pick(BPR_NOTES),
        ...stamp(noteAt),
      });
    }
  }

  // insert in FK-safe order
  await insert('batchProductionRecord', bprRows);
  await insert('lot', lotRows);
  await insert('lotOrigin', lotOriginRows);
  await insert('bprBillOfMaterials', bprBomRows);
  await insert('bprBatchStep', bprStepRows);
  await insert('bprStepActionable', bprActionableRows);
  await insert('transaction', transactionRows);
  await insert('bprStaging', stagingRows);
  await insert('bprStagingConsumption', consumptionRows);
  await insert('bprStatusTransition', transitionRows);
  await insert('bprNote', noteRows);
  await insert('activityLog', activityLogRows);

  return outputLots;
};
