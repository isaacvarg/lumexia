export interface ItemNoteTypeData {
  key: string; // stable lookup key used by the itemNotes data to resolve the type
  name: string;
  description: string;
  bgColor: string; // hex, badge background
  textColor: string; // hex, badge text
}

// Lumexia ships generic note types on init, but the demo gets its own playful,
// café-flavored set so notes read like they were jotted down by the Portals & Paws
// staff between drink orders and cat naps.
export const DEMO_ITEM_NOTE_TYPES: ReadonlyArray<ItemNoteTypeData> = [
  {
    key: 'storage',
    name: 'Storage & Handling',
    description: 'Where it lives and how to keep it from spoiling, escaping, or planeshifting.',
    bgColor: '#1e3a5f',
    textColor: '#dbeafe',
  },
  {
    key: 'supplierTip',
    name: 'Supplier Tip',
    description: 'Hard-won knowledge about the merchant, caravan, or portal we buy this through.',
    bgColor: '#3f2d56',
    textColor: '#ede9fe',
  },
  {
    key: 'warning',
    name: 'Allergen / Warning',
    description: 'Read before serving, handling, or letting a cat anywhere near it.',
    bgColor: '#5c1a1a',
    textColor: '#fee2e2',
  },
  {
    key: 'lore',
    name: 'Staff Lore',
    description: 'The stories, in-jokes, and superstitions the crew has attached to this item.',
    bgColor: '#3d2f17',
    textColor: '#fef3c7',
  },
  {
    key: 'reorder',
    name: 'Reorder Note',
    description: 'Pace, lead times, and how fast the regulars burn through it.',
    bgColor: '#14422f',
    textColor: '#d1fae5',
  },
  {
    key: 'prep',
    name: 'Prep Note',
    description: 'How the back of house actually preps, brews, or assembles it.',
    bgColor: '#3a2417',
    textColor: '#ffedd5',
  },
];
