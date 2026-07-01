import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { randFloat, stamp } from '../lib/timeline';
import { getUomId } from '../utils/getUomId';
import { DemoItem } from './items';

const poundsUom = () => (refs.uom as Record<string, string>).pounds;
const round2 = (n: number) => Math.round(n * 100) / 100;

// A live ItemPricingData row, surfaced so the pricing-examination layer can archive it
// (currentItemPricingDataId) instead of creating a duplicate.
export interface DemoItemPricingData {
  id: string;
  itemId: string;
  arrivalCost: number;
  productionUsageCost: number;
  auxiliaryUsageCost: number;
  unforeseenDifficultiesCost: number;
  isUpcomingPriceActive: boolean;
  upcomingPrice: number;
  upcomingPriceUomId: string;
  overallItemCost: number;
}

// Seeds exactly one ItemPricingData per item so every item can be priced without erroring.
//
// The app resolves an item's price from EITHER an active upcoming price OR its last purchase
// (see validatePricingBom / getTotalCostPerLbPurchased / getItemCost). Both cost-per-lb paths
// convert the price to $/lb and only skip the conversion when the price UOM is already pounds —
// a `units`-priced item would attempt an impossible `units → lb` conversion and throw. So:
//
//   • mass-UOM item (pounds/kg/grams) WITH purchase history → price from the real last purchase
//     (isUpcomingPriceActive: false); mass → lb conversions are seeded and work.
//   • units-UOM item, OR any item with no purchase history → an active upcoming price denominated
//     in pounds, which sidesteps conversion entirely and guarantees a resolvable price.
export const seedItemPricingData = async (
  items: DemoItem[],
  poBackedItemIds: Set<string>,
): Promise<Map<string, DemoItemPricingData>> => {
  const unitsUomId = getUomId('units');
  const rows: DemoItemPricingData[] = [];
  const byItemId = new Map<string, DemoItemPricingData>();

  for (const item of items) {
    const arrivalCost = round2(randFloat(0.2, 3));
    const productionUsageCost = round2(randFloat(0, 1.5));
    const auxiliaryUsageCost = round2(randFloat(0, 0.3));
    const unforeseenDifficultiesCost = round2(randFloat(0, 0.8));

    const isUnitBased = item.uomId === unitsUomId;
    const hasPurchaseHistory = poBackedItemIds.has(item.id);

    // mass item that has actually been purchased → lean on the real purchase price
    const usePurchaseHistory = !isUnitBased && hasPurchaseHistory;

    const upcomingPrice = usePurchaseHistory ? 0 : round2(randFloat(2, 40));
    const isUpcomingPriceActive = !usePurchaseHistory;

    // overallItemCost is a cached roll-up; keep it consistent with the chosen price source.
    const priceForRollup = usePurchaseHistory ? 0 : upcomingPrice;
    const overallItemCost = round2(
      priceForRollup + arrivalCost + productionUsageCost + unforeseenDifficultiesCost,
    );

    const row: DemoItemPricingData = {
      id: uuid(),
      itemId: item.id,
      arrivalCost,
      productionUsageCost,
      auxiliaryUsageCost,
      unforeseenDifficultiesCost,
      isUpcomingPriceActive,
      upcomingPrice,
      upcomingPriceUomId: poundsUom(),
      overallItemCost,
    };
    rows.push(row);
    byItemId.set(item.id, row);
  }

  await insert(
    'itemPricingData',
    rows.map((r) => ({ ...r, ...stamp(new Date()) })),
  );

  return byItemId;
};
