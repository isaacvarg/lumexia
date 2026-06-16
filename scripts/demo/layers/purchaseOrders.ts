import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import {
  addDays,
  chance,
  pick,
  randFloat,
  randInt,
  randomPastDate,
  sample,
  spreadDates,
  stamp,
} from '../lib/timeline';
import { generateLotNumber } from '@/utils/lot/generateLotNumber';
import { PO_ACCOUNTING_ACTIONS, PO_ACCOUNTING_NOTES, PO_NOTES, PO_NOTE_TYPES } from '../data/purchasing';
import { DemoSupplier } from './suppliers';
import { DemoItem } from './items';
import { DemoUser } from './users';

// A PO surfaced for downstream layers (purchasing requests link to these and
// mirror their progress).
export interface DemoPO {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reachedIndex: number; // index into FLOW
  statusKey: (typeof FLOW)[number];
  supplierId: string;
  userId: string;
  itemIds: string[];
  received: boolean; // partially or fully received
}

// A lot created from a received PO line, surfaced so audits can adjust against it.
export interface DemoLot {
  id: string;
  itemId: string;
  uomId: string;
  initialQuantity: number;
  createdAt: Date;
}

export interface PurchaseOrderResult {
  pos: DemoPO[];
  lots: DemoLot[];
}

// draft -> pending -> confirmed/awaiting -> partially received -> received
const FLOW = ['draft', 'pending', 'confirmedAwaitingDelivery', 'partiallyReceived', 'received'] as const;

const poStatusId = (key: string): string => (refs.purchaseOrderStatuses as Record<string, string>)[key];

/** How far along its lifecycle a PO is, biased so older POs are further along. */
const targetIndexForAge = (ageDays: number): number => {
  if (ageDays > 70) return chance(0.85) ? 4 : 3;
  if (ageDays > 45) return chance(0.6) ? 3 : 4;
  if (ageDays > 22) return chance(0.6) ? 2 : 3;
  if (ageDays > 8) return chance(0.6) ? 1 : 2;
  return chance(0.5) ? 0 : 1;
};

// keep a date strictly in the past so nothing looks like it happened "later than now"
const clampPast = (date: Date): Date => new Date(Math.min(date.getTime(), Date.now() - 3_600_000));

export const seedPurchaseOrders = async (
  count: number,
  suppliers: DemoSupplier[],
  purchasedItems: DemoItem[],
  purchasingUsers: DemoUser[],
): Promise<PurchaseOrderResult> => {
  // PurchaseOrderNoteType is not a static record, so seed a small themed set first.
  const noteTypes = PO_NOTE_TYPES.map((t) => ({ id: uuid(), ...t }));
  await insert(
    'purchaseOrderNoteType',
    noteTypes.map((t) => ({ id: t.id, name: t.name, description: t.description, bgColor: t.bgColor, textColor: t.textColor })),
  );
  const noteTypeIds = noteTypes.map((t) => t.id);

  const poRows: any[] = [];
  const poItemRows: any[] = [];
  const lotRows: any[] = [];
  const lotOriginRows: any[] = [];
  const transactionRows: any[] = [];
  const noteRows: any[] = [];
  const accountingRows: any[] = [];
  const accountingNoteRows: any[] = [];
  const auditRows: any[] = [];

  const resultPos: DemoPO[] = [];
  const resultLots: DemoLot[] = [];

  for (let i = 0; i < count; i++) {
    const poId = uuid();
    const createdAt = randomPastDate(2, 120);
    const ageDays = (Date.now() - createdAt.getTime()) / 86_400_000;
    const reachedIndex = targetIndexForAge(ageDays);
    const statusKey = FLOW[reachedIndex];
    const user = pick(purchasingUsers);
    const supplier = pick(suppliers);

    // transition timestamps from creation up to "now-ish"; last one is updatedAt
    const lastActivity = clampPast(addDays(createdAt, Math.min(ageDays - 0.2, randFloat(1, 25))));
    const transitionDates = [createdAt, ...spreadDates(createdAt, lastActivity, reachedIndex)];
    const updatedAt = transitionDates[transitionDates.length - 1];

    poRows.push({
      id: poId,
      submittingUserId: user.id,
      supplierId: supplier.id,
      statusId: poStatusId(statusKey),
      recordStatusId: refs.recordStatuses.active,
      ...stamp(createdAt, updatedAt),
    });

    // a note or two, scattered across the PO's life
    for (const noteAt of spreadDates(createdAt, updatedAt, chance(0.6) ? randInt(1, 2) : 0)) {
      noteRows.push({
        id: uuid(),
        purchaseOrderId: poId,
        noteTypeId: pick(noteTypeIds),
        userId: user.id,
        content: pick(PO_NOTES),
        ...stamp(noteAt),
      });
    }

    // line items; received/partial lines also produce inventory lots + transactions
    const lineItems = sample(purchasedItems, randInt(1, 4));
    const itemIds: string[] = [];
    lineItems.forEach((item, lineIdx) => {
      const poItemId = uuid();
      const quantity = randInt(5, 200);
      itemIds.push(item.id);
      let lotId: string | null = null;

      // fully received => every line in; partial => the first line (and maybe more)
      const lineReceived = reachedIndex === 4 || (reachedIndex === 3 && (lineIdx === 0 || chance(0.4)));
      if (lineReceived) {
        lotId = uuid();
        const receivedAt = updatedAt;
        lotRows.push({
          id: lotId,
          itemId: item.id,
          lotNumber: generateLotNumber(item.referenceCode, receivedAt),
          initialQuantity: quantity,
          uomId: item.uomId,
          ...stamp(receivedAt),
        });
        lotOriginRows.push({
          id: uuid(),
          lotId,
          purchaseOrderId: poId,
          bprId: null,
          originType: 'purchaseOrderReceiving',
          ...stamp(receivedAt),
        });
        transactionRows.push({
          id: uuid(),
          lotId,
          transactionTypeId: refs.transactionTypes.procurement,
          userId: user.id,
          uomId: item.uomId,
          amount: quantity,
          systemNote: 'Procurement — received against purchase order.',
          userNote: '',
          ...stamp(receivedAt),
        });
        resultLots.push({ id: lotId, itemId: item.id, uomId: item.uomId, initialQuantity: quantity, createdAt: receivedAt });
      }

      poItemRows.push({
        id: poItemId,
        purchaseOrderId: poId,
        itemId: item.id,
        lotId,
        quantity,
        pricePerUnit: randFloat(3, 80),
        uomId: item.uomId,
        purchaseOrderStatusId: poStatusId(lineReceived ? 'received' : statusKey),
        ...stamp(createdAt, updatedAt),
      });
    });

    // every PO gets a PoAccountingDetail at creation (mirrors createNewPO), so the
    // dashboard's accounting facet never reads `.status` off a null detail.
    if (reachedIndex < 3) {
      accountingRows.push({
        id: uuid(),
        statusId: refs.poAccountingStatuses.notStarted,
        purchaseOrderId: poId,
        paid: false,
        paymentMethodId: null,
        packingSlipReceived: false,
        paperworkGivenToAdmin: false,
        ...stamp(createdAt, updatedAt),
      });
    }

    // accounting begins moving once goods are in (partially or fully received)
    if (reachedIndex >= 3) {
      // how far accounting has progressed: 1..4 actions reached
      const accountingReached = reachedIndex === 4 ? randInt(2, 4) : randInt(1, 2);
      const accountingEnd = clampPast(addDays(updatedAt, randFloat(2, 18)));
      const accountingDates = [updatedAt, ...spreadDates(updatedAt, accountingEnd, Math.max(accountingReached - 1, 0))];
      const completedAt = accountingDates[accountingDates.length - 1];

      const completed = accountingReached >= 4;
      accountingRows.push({
        id: uuid(),
        statusId: completed ? refs.poAccountingStatuses.completed : refs.poAccountingStatuses.inProgress,
        purchaseOrderId: poId,
        paid: accountingReached >= 3,
        paymentMethodId: null,
        packingSlipReceived: accountingReached >= 2,
        paperworkGivenToAdmin: accountingReached >= 4,
        ...stamp(accountingDates[0], completedAt),
      });

      // one audit-log entry per accounting action reached
      for (let a = 0; a < accountingReached; a++) {
        auditRows.push({
          id: uuid(),
          poId,
          userId: user.id,
          action: PO_ACCOUNTING_ACTIONS[a].action,
          context: PO_ACCOUNTING_ACTIONS[a].context,
          ...stamp(accountingDates[Math.min(a, accountingDates.length - 1)]),
        });
      }

      for (const noteAt of spreadDates(accountingDates[0], completedAt, chance(0.5) ? randInt(1, 2) : 0)) {
        accountingNoteRows.push({
          id: uuid(),
          purchaseOrderId: poId,
          noteTypeId: refs.poAccountingNoteTypes.general,
          userId: user.id,
          content: pick(PO_ACCOUNTING_NOTES),
          ...stamp(noteAt),
        });
      }
    }

    resultPos.push({
      id: poId,
      createdAt,
      updatedAt,
      reachedIndex,
      statusKey,
      supplierId: supplier.id,
      userId: user.id,
      itemIds,
      received: reachedIndex >= 3,
    });
  }

  // insert in FK-safe order
  await insert('purchaseOrder', poRows);
  await insert('lot', lotRows);
  await insert('purchaseOrderItem', poItemRows);
  await insert('lotOrigin', lotOriginRows);
  await insert('transaction', transactionRows);
  await insert('purchaseOrderNote', noteRows);
  await insert('poAccountingDetail', accountingRows);
  await insert('poAccountingNote', accountingNoteRows);
  await insert('poAccountingAuditLog', auditRows);

  return { pos: resultPos, lots: resultLots };
};
