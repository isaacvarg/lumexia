import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { stamp } from '../lib/timeline';
import { PRICING_TEMPLATES } from '../data/pricing';
import { DemoItemType } from './itemTypes';
import { DemoItem } from './items';

const poundsUom = () => (refs.uom as Record<string, string>).pounds;

// finds a packaging item whose name contains the keyword (case-insensitive)
const matchPackaging = (packagingItems: DemoItem[], keyword: string): DemoItem | undefined =>
  packagingItems.find((i) => i.name.toLowerCase().includes(keyword.toLowerCase()));

// seeds reusable pricing templates (finished products + their auxiliaries). These are
// master data the app can later "apply" to an item to spin up finished products.
export const seedPricingTemplates = async (
  itemTypes: DemoItemType[],
  packagingItems: DemoItem[],
): Promise<void> => {
  const itemTypeIdByName = new Map(itemTypes.map((t) => [t.name, t.id]));

  const templateRows: any[] = [];
  const finishedProductRows: any[] = [];
  const auxiliaryRows: any[] = [];

  for (const template of PRICING_TEMPLATES) {
    const templateId = uuid();
    templateRows.push({
      id: templateId,
      name: template.name,
      description: template.description,
      forItemTypeId: itemTypeIdByName.get(template.forItemTypeName) ?? null,
      ...stamp(new Date()),
    });

    for (const fp of template.finishedProducts) {
      const fpId = uuid();
      finishedProductRows.push({
        id: fpId,
        apartOfPricingTemplateId: templateId,
        name: fp.name,
        fillQuantity: fp.fillQuantity,
        declaredQuantity: fp.declaredQuantity,
        freeShippingCost: fp.freeShippingCost,
        fillUomId: poundsUom(),
        difficultyAdjustmentCost: fp.difficultyAdjustmentCost,
        ...stamp(new Date()),
      });

      for (const aux of fp.auxiliaries) {
        const item = matchPackaging(packagingItems, aux.auxiliaryKeyword);
        if (!item) continue; // skip silently if no matching packaging item exists
        auxiliaryRows.push({
          id: uuid(),
          apartOfPricingTemplateFinishedProductId: fpId,
          auxiliaryItemId: item.id,
          quantity: aux.quantity,
          difficultyAdjustmentCost: aux.difficultyAdjustmentCost,
          ...stamp(new Date()),
        });
      }
    }
  }

  await insert('pricingTemplate', templateRows);
  await insert('pricingTemplateFinishedProduct', finishedProductRows);
  await insert('pricingTemplateAuxiliary', auxiliaryRows);
};
