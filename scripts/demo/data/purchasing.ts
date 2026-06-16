// Flavor-text pools for the purchasing / inventory history layers. All written in
// the Portals & Paws voice (a cozy planar cat café trading across Sigil, Baldur's
// Gate, the Nine Hells, the Feywild, the Underdark...). Consumed with `pick()`.

// PurchaseOrderNoteType has no static record, so the PO layer seeds these.
export interface PoNoteTypeData {
  key: string;
  name: string;
  description: string;
  bgColor: string;
  textColor: string;
}

export const PO_NOTE_TYPES: ReadonlyArray<PoNoteTypeData> = [
  { key: 'general', name: 'General', description: 'General purchase order note.', bgColor: '#e5e7eb', textColor: '#333333' },
  { key: 'supplier', name: 'Supplier Comms', description: 'Back-and-forth with the merchant or caravan.', bgColor: '#3f2d56', textColor: '#ede9fe' },
  { key: 'internal', name: 'Internal', description: 'Notes for the crew, not the supplier.', bgColor: '#14422f', textColor: '#d1fae5' },
];

export const PO_NOTES: ReadonlyArray<string> = [
  'Supplier swears the brimstone is fresh-cracked this caravan. We shall see.',
  'Portal tariff went up again — Sigil paperwork is a nightmare this cycle.',
  'Asked them to double-wrap anything fey-touched so it stops humming in transit.',
  'Bramble vouches for this merchant; says they have never short-counted her.',
  'Held the order a day so it would not arrive during the Blood War regulars rush.',
  'Caravan delayed at the Lower Ward gate. Devil customs, of course.',
  'Split the delivery so the milk does not sit in the astral cold too long.',
  'Merchant threw in a sample of the new vanilla — Penelope is testing it.',
  'Confirmed the gold-for-trade rate before submitting. No surprises this time.',
  'Asked for the heavy crate this round; last batch arrived rattled to dust.',
  'They are out of the usual roast, substituting the Waterdeep medium. Approved.',
  'Reminded them we are a CAT café — no enchanted mice in the packing straw again.',
];

// PoAccountingAuditLog action/context pairs, in the order accounting progresses.
export interface PoAccountingAction {
  action: string;
  context: string;
}

export const PO_ACCOUNTING_ACTIONS: ReadonlyArray<PoAccountingAction> = [
  { action: 'Accounting Started', context: 'Opened accounting review after goods were received.' },
  { action: 'Packing Slip Received', context: 'Marked the supplier packing slip as received and filed.' },
  { action: 'Marked Paid', context: 'Payment released to the supplier.' },
  { action: 'Paperwork Archived', context: 'Paperwork handed to the front-of-house admin and archived.' },
];

export const PO_ACCOUNTING_NOTES: ReadonlyArray<string> = [
  'Invoice total matched the packing slip down to the last copper. Rare and lovely.',
  'Short a crate of napkins — withheld that line until the supplier credits us.',
  'Paid in mixed coin; the Hells merchant would not take Baldurian script.',
  'Waiting on Morgra to counter-sign before this gets archived.',
  'Packing slip smudged by brimstone soot but legible. Filed anyway.',
  'Flagged for follow-up: price per unit crept up without notice.',
];

// PurchasingRequest titles — `%s` is replaced with the item name.
export const REQUEST_TITLES: ReadonlyArray<string> = [
  'Running low on %s',
  'Restock %s before the weekend rush',
  'Need %s for the new seasonal menu',
  '%s — down to the last crate',
  'Reorder %s (regulars are asking)',
  'Top up %s ahead of faction night',
  'Out of %s, please source',
];

export const REQUEST_NOTES: ReadonlyArray<string> = [
  'Production flagged this during the morning count — we are nearly dry.',
  'Last supplier ghosted us; may need to shop the Sigil market for a new one.',
  'Not urgent yet, but lead time on this one is brutal across the planes.',
  'Tied to the Feywild scone batch — cannot run it without this.',
  'Asked purchasing to check pricing before we commit to a full crate.',
  'Holding for now; we might consolidate this with the dairy order.',
  'Regulars will riot if we run out before the weekend. Bumping priority.',
];

export const AUDIT_REQUEST_NOTES: ReadonlyArray<string> = [
  'Counts looked off after the weekend — requesting a manual recount.',
  'Suspect a lot was logged twice during the busy receiving day.',
  'Cat knocked a crate behind the shelf; verifying what actually survived.',
  'Recount complete, adjusted to match the physical shelf count.',
  'Numbers reconciled — the earlier discrepancy was a UOM mix-up.',
];

export const DISCREPANCY_NOTES: ReadonlyArray<string> = [
  'Cycle count caught a small shrinkage — adjusted to the physical total.',
  'Found extra in the back cold-store that never got logged. Added it in.',
  'Left unchecked when we closed the audit; the Hells caravan arrived mid-count.',
  'Matched exactly. The clockwork tabby supervised and approved.',
  'Off by a hair, within tolerance. Noted and moved on.',
];
