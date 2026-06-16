import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { DEMO_ITEM_TYPES } from '../data/itemTypes';
import { refs } from '../lib/refs';

export interface DemoItemType {
  id: string;
  name: string;
}

// initializing Lumexia creates itemTypes that are standard for the industry
// however, these did not fit the fantasy and playful d&d vibe or the demo data

export const seedItemTypes = async (): Promise<DemoItemType[]> => {


  const itemTypes: DemoItemType[] = DEMO_ITEM_TYPES.map((s) => ({ id: uuid(), name: s.name }));

  await insert(
    'itemType',
    DEMO_ITEM_TYPES.map((s, i) => ({
      id: itemTypes[i].id,
      name: s.name,
    })),
  );

  // adding this to the demo data because it fits with the demo
  itemTypes.push({ id: refs.itemTypes.packaging, name: "Packaging" })


  return itemTypes;
};
