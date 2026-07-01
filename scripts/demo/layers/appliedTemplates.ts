import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { randFloat, stamp } from '../lib/timeline';
import { PRICING_TEMPLATES, PricingTemplateData } from '../data/pricing';
import { DemoItem } from './items';

const poundsUom = () => (refs.uom as Record<string, string>).pounds;
const round2 = (n: number) => Math.round(n * 100) / 100;

// finds a packaging item whose name contains the keyword (case-insensitive)
const matchPackaging = (packagingItems: DemoItem[], keyword: string): DemoItem | undefined =>
  packagingItems.find((i) => i.name.toLowerCase().includes(keyword.toLowerCase()));

// A live finished product surfaced so the examination layer can archive it instead of
// creating a duplicate.
export interface DemoFinishedProductAux {
  auxiliaryItemId: string;
  quantity: number;
  difficultyAdjustmentCost: number;
}
export interface DemoFinishedProduct {
  id: string;
  name: string;
  filledWithItemId: string;
  fillQuantity: number;
  declaredQuantity: number;
  freeShippingCost: number;
  difficultyAdjustmentCost: number;
  auxiliaries: DemoFinishedProductAux[];
}

// which real templates apply to which item type — produced drinks/bakes plus the
// sellable-purchased retail lines. Raw inputs (Ingredients, Cafe Supplies) are excluded.
const DRINK_RE = /espresso|chai|latte|tea|mocha|iced|coffee/i;

const templatesFor = (item: DemoItem): PricingTemplateData[] => {
  const forType = PRICING_TEMPLATES.filter((t) => t.forItemTypeName === item.type);
  if (forType.length <= 1) return forType;
  // multiple templates for a type (Recipes) — pick one so each item gets a single, sensible
  // finished-product spec: drinks get the to-go cup, everything else the bakery bag.
  const drink = DRINK_RE.test(item.name);
  const chosen = forType.find((t) => (drink ? /drink/i.test(t.name) : /bakery/i.test(t.name)));
  return [chosen ?? forType[0]];
};

// Applies pricing templates to produced + sellable-purchased items, creating the live
// FinishedProduct (+ auxiliaries) rows an examination reads, so opening one shows data.
export const seedAppliedTemplates = async (
  items: DemoItem[],
  packagingItems: DemoItem[],
): Promise<Map<string, DemoFinishedProduct[]>> => {
  const templateTypes = new Set(PRICING_TEMPLATES.map((t) => t.forItemTypeName));
  const targets = items.filter((i) => templateTypes.has(i.type));

  const fpRows: any[] = [];
  const auxRows: any[] = [];
  const byItemId = new Map<string, DemoFinishedProduct[]>();

  for (const item of targets) {
    const produced: DemoFinishedProduct[] = [];

    for (const template of templatesFor(item)) {
      for (const fpSpec of template.finishedProducts) {
        const auxiliaries: DemoFinishedProductAux[] = [];
        for (const auxSpec of fpSpec.auxiliaries) {
          const auxItem = matchPackaging(packagingItems, auxSpec.auxiliaryKeyword);
          if (!auxItem) continue; // skip silently if no matching packaging item exists
          auxiliaries.push({
            auxiliaryItemId: auxItem.id,
            quantity: auxSpec.quantity,
            difficultyAdjustmentCost: auxSpec.difficultyAdjustmentCost,
          });
        }

        const fpId = uuid();
        // nominal cost roll-up; the app recomputes these live on display from current pricing.
        const productFillCost = round2(fpSpec.fillQuantity * randFloat(2, 40));
        const auxiliariesTotalCost = round2(auxiliaries.reduce((acc) => acc + randFloat(0.02, 0.08), 0));
        const finishedProductTotalCost = round2(productFillCost + auxiliariesTotalCost + fpSpec.difficultyAdjustmentCost);
        const consumerPrice = round2(finishedProductTotalCost * randFloat(1.6, 2.6));
        const markup = round2(consumerPrice - finishedProductTotalCost);
        const profitPercentage = consumerPrice ? round2((markup / consumerPrice) * 100) : 0;

        fpRows.push({
          id: fpId,
          recordStatusId: refs.recordStatuses.active,
          name: `${item.name} — ${fpSpec.name}`,
          filledWithItemId: item.id,
          fillQuantity: fpSpec.fillQuantity,
          declaredQuantity: fpSpec.declaredQuantity,
          freeShippingCost: fpSpec.freeShippingCost,
          fillUomId: poundsUom(),
          difficultyAdjustmentCost: fpSpec.difficultyAdjustmentCost,
          finishedProductTotalCost,
          auxiliariesTotalCost,
          productFillCost,
          consumerPrice,
          markup,
          profit: markup,
          profitPercentage,
          ...stamp(new Date()),
        });

        for (const aux of auxiliaries) {
          auxRows.push({
            id: uuid(),
            apartOfFinishedProductId: fpId,
            auxiliaryItemId: aux.auxiliaryItemId,
            recordStatusId: refs.recordStatuses.active,
            quantity: aux.quantity,
            difficultyAdjustmentCost: aux.difficultyAdjustmentCost,
            ...stamp(new Date()),
          });
        }

        produced.push({
          id: fpId,
          name: `${item.name} — ${fpSpec.name}`,
          filledWithItemId: item.id,
          fillQuantity: fpSpec.fillQuantity,
          declaredQuantity: fpSpec.declaredQuantity,
          freeShippingCost: fpSpec.freeShippingCost,
          difficultyAdjustmentCost: fpSpec.difficultyAdjustmentCost,
          auxiliaries,
        });
      }
    }

    if (produced.length) byItemId.set(item.id, produced);
  }

  await insert('finishedProduct', fpRows);
  await insert('finishedProductAuxiliary', auxRows);

  return byItemId;
};
