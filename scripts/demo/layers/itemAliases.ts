import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { randomPastDate, stamp } from '../lib/timeline';
import { DEMO_ITEM_ALIASES } from '../data/itemAliases';
import { DemoItem } from './items';
import { DemoSupplier } from './suppliers';

// attaches café nicknames and supplier catalog names to their items. Alias types
// are a static record (refs.aliasTypes), so only the item lookup is dynamic.
//
// a `supplier`-type alias is meaningless without a SupplierAlias join row linking
// it to a real supplier, so for those we also emit a supplierAlias row.
export const seedItemAliases = async (
  items: DemoItem[],
  suppliers: DemoSupplier[],
): Promise<void> => {
  const itemIdByName = new Map(items.map((i) => [i.name, i.id]));
  const supplierIdByName = new Map(suppliers.map((s) => [s.name, s.id]));

  const aliasRows = [];
  const supplierAliasRows = [];

  for (const alias of DEMO_ITEM_ALIASES) {
    const itemId = itemIdByName.get(alias.itemName);
    if (!itemId) {
      throw new Error(`😭 alias references unknown item "${alias.itemName}". Check data/items.ts for the exact name.`);
    }

    const aliasId = uuid();
    aliasRows.push({
      id: aliasId,
      name: alias.name,
      aliasTypeId: refs.aliasTypes[alias.aliasTypeKey],
      itemId,
      ...stamp(randomPastDate(1, 180)),
    });

    // supplier aliases must point at a real seeded supplier via a join row
    if (alias.aliasTypeKey === 'supplier') {
      if (!alias.supplierName) {
        throw new Error(`😭 supplier alias "${alias.name}" is missing a supplierName. Add one in data/itemAliases.ts.`);
      }
      const supplierId = supplierIdByName.get(alias.supplierName);
      if (!supplierId) {
        throw new Error(`😭 alias references unknown supplier "${alias.supplierName}". Check data/suppliers.ts for the exact name.`);
      }
      supplierAliasRows.push({ id: uuid(), aliasId, supplierId });
    }
  }

  await insert('alias', aliasRows);
  await insert('supplierAlias', supplierAliasRows);
};
