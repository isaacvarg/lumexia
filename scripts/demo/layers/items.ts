import { Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import {
  DEMO_INGREDIENTS_ITEMS,
  DEMO_CAFE_SUPPLIES_ITEMS,
  DEMO_CAT_SUPPLIES_ITEMS,
  DEMO_TABLETOP_ITEMS,
  DEMO_RECIPES_ITEMS,
  DEMO_MERCHANDISE_ITEMS,
  ItemData,
} from '../data/items';
import { getUomId } from '../utils/getUomId';
import { DemoItemType } from './itemTypes';


export interface DemoItem {
  id: string;
  name: string;
  referenceCode: string;
  uomId: string;
  procurement: 'purchased' | 'produced';
  type: string;
}

interface DemoItems {
  all: DemoItem[];
  purchased: DemoItem[];
  produced: DemoItem[];
  ingredients: DemoItem[];
}

type ItemPayload = Prisma.ItemCreateManyInput;

// each demo group maps to one itemTypeand gets its
// own referenceCode prefix + numbering range so codes read like ING-1001, etc.
interface GroupConfig {
  data: ReadonlyArray<ItemData>;
  typeName: string;
  prefix: string;
  seqStart: number;
  inventoryType: keyof typeof refs.inventoryTypes;
  isIngredient?: boolean; // not super necessary but might be helpful if we expand the demo
}

const GROUPS: ReadonlyArray<GroupConfig> = [
  { data: DEMO_INGREDIENTS_ITEMS, typeName: 'Ingredients', prefix: 'ING', seqStart: 1000, inventoryType: 'tracked', isIngredient: true },
  { data: DEMO_CAFE_SUPPLIES_ITEMS, typeName: 'Cafe Supplies', prefix: 'CAF', seqStart: 2000, inventoryType: 'consumable' },
  { data: DEMO_CAT_SUPPLIES_ITEMS, typeName: 'Cat Supplies', prefix: 'CAT', seqStart: 3000, inventoryType: 'consumable' },
  { data: DEMO_TABLETOP_ITEMS, typeName: 'Tabletop', prefix: 'TAB', seqStart: 4000, inventoryType: 'tracked' },
  { data: DEMO_RECIPES_ITEMS, typeName: 'Recipes', prefix: 'RCP', seqStart: 5000, inventoryType: 'tracked' },
  { data: DEMO_MERCHANDISE_ITEMS, typeName: 'Merchandise', prefix: 'MER', seqStart: 6000, inventoryType: 'tracked' },
];


export const seedItems = async (itemTypes: DemoItemType[]): Promise<DemoItems> => {

  // resolve demo itemType ids by name (they are created with fresh uuids in
  // seedItemTypes, so they don't live in the static refs)
  const itemTypeIdByName = new Map(itemTypes.map((t) => [t.name, t.id]));

  // arrays for downstream layers
  const rows: ItemPayload[] = [];
  const all: DemoItem[] = [];
  const purchased: DemoItem[] = [];
  const produced: DemoItem[] = [];
  const ingredients: DemoItem[] = [];

  for (const group of GROUPS) {
    const itemTypeId = itemTypeIdByName.get(group.typeName);
    if (!itemTypeId) {
      throw new Error(`😭 Missing demo itemType "${group.typeName}". Make sure it was seeded in seedItemTypes?`);
    }

    let seq = group.seqStart;

    for (const data of group.data) {
      const referenceCode = `${group.prefix}-${++seq}`;
      const item: DemoItem = {
        id: uuid(),
        name: data.name,
        referenceCode,
        uomId: getUomId(data.uomKey),
        procurement: data.procurement,
        type: group.typeName,
      };

      // collect into the arrays the downstream layers need
      all.push(item);

      if (data.procurement === 'produced') {
        produced.push(item);
      } else {
        purchased.push(item);
      }

      if (group.isIngredient) {
        ingredients.push(item);
      }

      // payload array
      rows.push({
        id: item.id,
        referenceCode,
        name: data.name,
        recordStatusId: refs.recordStatuses.active,
        itemTypeId,
        inventoryUomId: item.uomId,
        procurementTypeId: refs.procurementTypes[data.procurement],
        inventoryTypeId: refs.inventoryTypes[group.inventoryType],
      });
    }
  }

  await insert('item', rows);

  return { all, purchased, produced, ingredients };
};
