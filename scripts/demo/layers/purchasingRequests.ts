import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { addDays, chance, pick, randFloat, randInt, randomPastDate, spreadDates, stamp } from '../lib/timeline';
import { REQUEST_NOTES, REQUEST_TITLES } from '../data/purchasing';
import { DemoItem } from './items';
import { DemoUser } from './users';
import { DemoPO } from './purchaseOrders';

const reqStatusId = (key: string): string => (refs.requestStatuses as Record<string, string>)[key];
const reqNoteTypeId = (key: string): string => (refs.requestNoteTypes as Record<string, string>)[key];
const priorityId = (key: string): string => (refs.requestPriorities as Record<string, string>)[key];

// request status mirrors how far the PO it spawned has progressed
const reqStatusForPo = (reachedIndex: number): string => {
  if (reachedIndex <= 1) return 'poPending';
  if (reachedIndex === 2) return chance(0.5) ? 'poConfirmed' : 'expectedDeliveryDate';
  if (reachedIndex === 3) return 'partialDelivery';
  return 'delivered';
};

// standalone requests that have not yet become a PO (some friction in the mix)
const STANDALONE_STATUSES = [
  'requested',
  'requested',
  'pricingRequested',
  'allocatingIngredients',
  'onHold',
  'requestCancelledDuplicateRequest',
] as const;

const PRIORITY_POOL = ['normal', 'normal', 'normal', 'high', 'low'] as const;

const titleFor = (itemName: string): string => pick(REQUEST_TITLES).replace('%s', itemName);

export const seedPurchasingRequests = async (
  pos: DemoPO[],
  purchasedItems: DemoItem[],
  purchasingUsers: DemoUser[],
): Promise<void> => {
  const itemNameById = new Map(purchasedItems.map((i) => [i.id, i.name]));

  const requestRows: any[] = [];
  const snapshotRows: any[] = [];
  const linkRows: any[] = [];
  const noteRows: any[] = [];

  const buildRequest = (params: {
    itemId: string;
    itemName: string;
    statusKey: string;
    createdAt: Date;
    updatedAt: Date;
    pendingPoIds: string[];
    expectDelivery: boolean;
  }) => {
    const { itemId, itemName, statusKey, createdAt, updatedAt, pendingPoIds, expectDelivery } = params;
    const requestId = uuid();
    const user = pick(purchasingUsers);

    requestRows.push({
      id: requestId,
      requestingUserId: user.id,
      statusId: reqStatusId(statusKey),
      priorityId: priorityId(pick(PRIORITY_POOL)),
      itemId,
      title: titleFor(itemName),
      expectedDateStart: expectDelivery ? addDays(updatedAt, randFloat(1, 4)) : null,
      expectedDateEnd: expectDelivery ? addDays(updatedAt, randFloat(5, 12)) : null,
      ...stamp(createdAt, updatedAt),
    });

    const onHand = randFloat(0, 40);
    const allocated = randFloat(0, onHand);
    snapshotRows.push({
      id: uuid(),
      requestId,
      objectName: itemName,
      onHandQuantity: onHand,
      warningShown: chance(0.4),
      warningOverridden: chance(0.2),
      allocatedQuantity: allocated,
      availableQuantity: Math.max(onHand - allocated, 0),
      allocatedBprIds: [],
      pendingPoIds,
      ...stamp(createdAt),
    });

    // a scattered note or two, plus an automated note once delivered
    for (const noteAt of spreadDates(createdAt, updatedAt, chance(0.6) ? randInt(1, 2) : 0)) {
      noteRows.push({
        id: uuid(),
        requestId,
        noteTypeId: reqNoteTypeId(pick(['general', 'general', 'eta', 'followUp'])),
        userId: user.id,
        content: pick(REQUEST_NOTES),
        ...stamp(noteAt),
      });
    }
    if (statusKey === 'delivered' || statusKey === 'partialDelivery') {
      noteRows.push({
        id: uuid(),
        requestId,
        noteTypeId: reqNoteTypeId('automated'),
        userId: user.id,
        content: statusKey === 'delivered'
          ? 'Automated: connected purchase order received in full — request marked delivered.'
          : 'Automated: connected purchase order partially received — request marked partial delivery.',
        ...stamp(updatedAt),
      });
    }

    return requestId;
  };

  // 1) requests woven into the PO narrative — created a few days before their PO
  for (const po of pos) {
    if (po.itemIds.length === 0 || !chance(0.6)) continue;
    const itemId = pick(po.itemIds);
    const statusKey = reqStatusForPo(po.reachedIndex);
    const createdAt = addDays(po.createdAt, -randFloat(1, 8));

    const requestId = buildRequest({
      itemId,
      itemName: itemNameById.get(itemId) ?? 'Unknown Item',
      statusKey,
      createdAt,
      updatedAt: po.updatedAt,
      pendingPoIds: po.received ? [] : [po.id],
      expectDelivery: statusKey === 'poConfirmed' || statusKey === 'expectedDeliveryDate',
    });

    linkRows.push({ id: uuid(), requestId, poId: po.id, ...stamp(createdAt) });
  }

  // 2) standalone requests not yet turned into a PO
  for (let i = 0; i < 16; i++) {
    const item = pick(purchasedItems);
    const statusKey = pick(STANDALONE_STATUSES);
    const createdAt = randomPastDate(1, 40);
    const updatedAt = addDays(createdAt, randFloat(0.2, 6));

    buildRequest({
      itemId: item.id,
      itemName: item.name,
      statusKey,
      createdAt,
      updatedAt: new Date(Math.min(updatedAt.getTime(), Date.now() - 3_600_000)),
      pendingPoIds: [],
      expectDelivery: false,
    });
  }

  await insert('purchasingRequest', requestRows);
  await insert('requestInventorySnapshot', snapshotRows);
  await insert('requestPurchaseOrder', linkRows);
  await insert('requestNote', noteRows);
};
