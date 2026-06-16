import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { PACK_PURCHASES, PACK_UOMS } from '../data/uomConversions';
import { DemoItem } from './items';

export interface PackInfo {
  packUomId: string;
  inventoryUomId: string;
  factor: number; // inventory units per 1 pack
}

// seeds the non-standard pack UOMs and returns a map of which ingredient items are
// purchased in a pack unit (consumed by the PO layer to build pack lines + the discrete
// conversions). The pack UOMs are isStandardUom=false so the converter uses the discrete
// path. Reset removes them via a targeted `isStandardUom: false` delete.
export const seedPackUoms = async (ingredientItems: DemoItem[]): Promise<Map<string, PackInfo>> => {
  const packUomIdByKey = new Map(PACK_UOMS.map((u) => [u.key, uuid()]));

  await insert(
    'unitOfMeasurement',
    PACK_UOMS.map((u) => ({
      id: packUomIdByKey.get(u.key)!,
      name: u.name,
      abbreviation: u.abbreviation,
      isStandardUom: false,
    })),
  );

  const itemByName = new Map(ingredientItems.map((i) => [i.name, i]));
  const packMap = new Map<string, PackInfo>();

  for (const pack of PACK_PURCHASES) {
    const item = itemByName.get(pack.itemName);
    if (!item) {
      throw new Error(`😭 pack purchase references unknown ingredient "${pack.itemName}". Check data/items.ts.`);
    }
    const packUomId = packUomIdByKey.get(pack.packUomKey);
    if (!packUomId) {
      throw new Error(`😭 pack purchase uses unknown packUomKey "${pack.packUomKey}". Check data/uomConversions.ts.`);
    }
    packMap.set(item.id, { packUomId, inventoryUomId: item.uomId, factor: pack.inventoryPerPack });
  }

  return packMap;
};
