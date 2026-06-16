import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { addDays, chance, pick, randFloat, randInt, randomPastDate, sample, stamp } from '../lib/timeline';
import { AUDIT_REQUEST_NOTES, DISCREPANCY_NOTES } from '../data/purchasing';
import { DemoItem } from './items';
import { DemoUser } from './users';
import { DemoLot } from './purchaseOrders';

const AUDIT_REQUEST_COUNT = 24;
const DISCREPANCY_AUDIT_COUNT = 5;

// keep a date strictly in the past
const clampPast = (date: Date): Date => new Date(Math.min(date.getTime(), Date.now() - 3_600_000));

export const seedAudits = async (
  purchasedItems: DemoItem[],
  lots: DemoLot[],
  users: DemoUser[],
): Promise<void> => {
  // lots grouped by item, so an audit adjustment can target a real lot
  const lotsByItem = new Map<string, DemoLot[]>();
  for (const lot of lots) {
    const list = lotsByItem.get(lot.itemId) ?? [];
    list.push(lot);
    lotsByItem.set(lot.itemId, list);
  }

  const inventoryAuditRows: any[] = [];
  const auditRequestRows: any[] = [];
  const auditRequestNoteRows: any[] = [];
  const discrepancyAuditRows: any[] = [];
  const discrepancyAuditItemRows: any[] = [];
  const transactionRows: any[] = [];
  const inventoryAuditTxRows: any[] = [];
  const discrepancyItemTxRows: any[] = [];
  const discrepancyItemNoteRows: any[] = [];

  // emit an adjustment transaction against a real lot of `item`; returns its id or null
  const adjustmentTransaction = (
    itemId: string,
    userId: string,
    at: Date,
    systemNote: string,
  ): string | null => {
    const itemLots = lotsByItem.get(itemId);
    if (!itemLots || itemLots.length === 0) return null;
    const lot = pick(itemLots);
    const addition = chance(0.5);
    const txId = uuid();
    transactionRows.push({
      id: txId,
      lotId: lot.id,
      transactionTypeId: addition ? refs.transactionTypes.adjustmentAddition : refs.transactionTypes.adjustmentRemoval,
      userId,
      uomId: lot.uomId,
      amount: randFloat(1, 12),
      systemNote,
      userNote: '',
      ...stamp(at),
    });
    return txId;
  };

  // ── Audit requests → inventory audits ─────────────────────────────────────
  for (let i = 0; i < AUDIT_REQUEST_COUNT; i++) {
    const item = pick(purchasedItems);
    const user = pick(users);
    const requestId = uuid();
    const createdAt = randomPastDate(1, 90);
    const completed = chance(0.75);

    if (completed) {
      const completedAt = clampPast(addDays(createdAt, randFloat(0.2, 6)));
      const auditId = uuid();
      inventoryAuditRows.push({
        id: auditId,
        itemId: item.id,
        conductedById: user.id,
        ...stamp(completedAt),
      });

      auditRequestRows.push({
        id: requestId,
        requestById: user.id,
        inventoryAuditId: auditId,
        statusId: refs.auditRequestStatuses.completed,
        itemId: item.id,
        ...stamp(createdAt, completedAt),
      });

      // most completed audits found a small discrepancy and adjusted
      if (chance(0.6)) {
        const before = randFloat(5, 60);
        const after = clampNonNeg(before + randFloat(-8, 8));
        const txId = adjustmentTransaction(item.id, user.id, completedAt, 'Inventory Audit — manual recount adjustment.');
        if (txId) {
          inventoryAuditTxRows.push({
            id: uuid(),
            transactionId: txId,
            inventoryAuditId: auditId,
            quantityBefore: before,
            quantityAfter: after,
            ...stamp(completedAt),
          });
        }
      }

      auditRequestNoteRows.push({
        id: uuid(),
        requestId,
        noteTypeId: refs.auditRequestNoteTypes.automated,
        userId: user.id,
        content: 'Automated: inventory audit completed and transactions reconciled.',
        ...stamp(completedAt),
      });
    } else {
      auditRequestRows.push({
        id: requestId,
        requestById: user.id,
        inventoryAuditId: null,
        statusId: refs.auditRequestStatuses.open,
        itemId: item.id,
        ...stamp(createdAt),
      });
      auditRequestNoteRows.push({
        id: uuid(),
        requestId,
        noteTypeId: refs.auditRequestNoteTypes.general,
        userId: user.id,
        content: pick(AUDIT_REQUEST_NOTES),
        ...stamp(createdAt),
      });
    }
  }

  // ── Discrepancy (cycle count) audits ──────────────────────────────────────
  for (let i = 0; i < DISCREPANCY_AUDIT_COUNT; i++) {
    const auditId = uuid();
    const createdAt = randomPastDate(5, 100);
    const closed = chance(0.7);
    const completedAt = clampPast(addDays(createdAt, randFloat(0.5, 4)));
    const user = pick(users);

    discrepancyAuditRows.push({
      id: auditId,
      completedOn: closed ? completedAt.toISOString() : null,
      itemTypeId: null, // null = all item types
      statusId: closed ? refs.discrepancyAuditStatuses.closed : refs.discrepancyAuditStatuses.open,
      ...stamp(createdAt, closed ? completedAt : createdAt),
    });

    const auditItems = sample(purchasedItems, randInt(8, 20));
    for (const item of auditItems) {
      const auditItemId = uuid();
      const startingTotal = randFloat(0, 80);
      const startingLots = randInt(0, 6);
      const startingDepleted = randInt(0, 4);

      // open audit => everything still notChecked; closed => mostly audited, some left incomplete
      const itemStatus = !closed ? 'notChecked' : chance(0.85) ? 'audited' : 'incomplete';
      const audited = itemStatus === 'audited';

      const endingTotal = audited ? clampNonNeg(startingTotal + randFloat(-6, 6)) : null;

      discrepancyAuditItemRows.push({
        id: auditItemId,
        itemId: item.id,
        statusId: (refs.discrepancyAuditItemStatuses as Record<string, string>)[itemStatus],
        discrepancyAuditId: auditId,
        startingTotalQuantity: startingTotal,
        endingTotalQuantity: endingTotal,
        quantitiesUomId: item.uomId,
        startingLotsCount: startingLots,
        endingLotsCount: audited ? startingLots : null,
        startingDepletedLotsCount: startingDepleted,
        endingDepletedLotsCount: audited ? startingDepleted : null,
        ...stamp(createdAt, audited ? completedAt : createdAt),
      });

      // an audited item whose count moved produces an adjustment transaction
      if (audited && endingTotal !== null && Math.abs(endingTotal - startingTotal) > 0.01) {
        const txId = adjustmentTransaction(item.id, user.id, completedAt, 'Discrepancy Audit Item Adjustment');
        if (txId) {
          discrepancyItemTxRows.push({
            id: uuid(),
            auditItemId,
            transactionId: txId,
            quantityBefore: startingTotal,
            quantityAfter: endingTotal,
            ...stamp(completedAt),
          });
        }
      }

      // items left unchecked when a closed audit ended get an automated note
      if (itemStatus === 'incomplete') {
        discrepancyItemNoteRows.push({
          id: uuid(),
          auditItemId,
          noteTypeId: refs.discrepancyAuditItemNoteTypes.automated,
          userId: user.id,
          content: pick(DISCREPANCY_NOTES),
          ...stamp(completedAt),
        });
      }
    }
  }

  // insert in FK-safe order
  await insert('inventoryAudit', inventoryAuditRows);
  await insert('auditRequest', auditRequestRows);
  await insert('auditRequestNote', auditRequestNoteRows);
  await insert('discrepancyAudit', discrepancyAuditRows);
  await insert('discrepancyAuditItem', discrepancyAuditItemRows);
  await insert('transaction', transactionRows);
  await insert('inventoryAuditTransaction', inventoryAuditTxRows);
  await insert('discrepancyAuditItemTransaction', discrepancyItemTxRows);
  await insert('discrepancyAuditItemNote', discrepancyItemNoteRows);
};

const clampNonNeg = (n: number): number => Math.round(Math.max(n, 0) * 100) / 100;
