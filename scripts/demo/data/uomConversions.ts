// Demo data that exercises the DISCRETE uom-conversion path: a few ingredients are
// genuinely purchased in a non-standard "pack" unit that differs from the item's
// inventory unit, so the system requires a per-(item, supplier) discrete conversion.

export interface PackUomData {
  key: string;
  name: string;
  abbreviation: string;
}

// non-standard pack units (isStandardUom = false in the DB so the converter takes the
// discrete branch).
export const PACK_UOMS: ReadonlyArray<PackUomData> = [
  { key: 'sack', name: 'Sack', abbreviation: 'sk' },
  { key: 'drum', name: 'Drum', abbreviation: 'dr' },
  { key: 'crate', name: 'Crate', abbreviation: 'crt' },
];

export interface PackPurchaseData {
  itemName: string; // must match an ingredient item name in data/items.ts
  packUomKey: string; // matches a PACK_UOMS key
  inventoryPerPack: number; // how many inventory units (the item's inventory uom) per 1 pack
}

// Each listed ingredient is bought in its pack unit. The inventoryPerPack is the
// conversion factor (1 pack = N of the item's inventory unit).
export const PACK_PURCHASES: ReadonlyArray<PackPurchaseData> = [
  { itemName: 'Powdered Underdark Flour', packUomKey: 'sack', inventoryPerPack: 50 }, // 1 sack = 50 lb
  { itemName: 'Astral Espresso Beans', packUomKey: 'crate', inventoryPerPack: 20 }, // 1 crate = 20 lb
  { itemName: 'Feywild Honey Crystals', packUomKey: 'drum', inventoryPerPack: 5000 }, // 1 drum = 5000 g
];
