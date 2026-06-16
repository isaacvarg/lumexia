import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { chance, pick, randFloat, randomPastDate, spreadDates, stamp } from '../lib/timeline';
import { RECIPES } from '../data/recipes';
import { MBPR_NOTES, MBPR_NOTE_TYPES } from '../data/production';
import { DemoItem } from './items';
import { DemoUser } from './users';
import { DemoEquipment } from './equipment';

export interface DemoMbpr {
  id: string;
  versionLabel: string;
  producesItem: { id: string; referenceCode: string };
  batchSizes: { id: string; quantity: number }[];
  steps: { id: string; actionableIds: string[] }[];
  bomLines: { id: string; itemId: string; concentration: number }[];
}

const recordActive = () => refs.recordStatuses.active;
const poundsUom = () => (refs.uom as Record<string, string>).pounds;

export const seedMbprs = async (
  producedItems: DemoItem[],
  ingredients: DemoItem[],
  equipment: DemoEquipment[],
  users: DemoUser[],
): Promise<DemoMbpr[]> => {
  const producedByName = new Map(producedItems.map((i) => [i.name, i]));
  const ingredientByName = new Map(ingredients.map((i) => [i.name, i]));
  const equipmentByType = new Map<string, DemoEquipment[]>();
  for (const e of equipment) {
    const list = equipmentByType.get(e.typeKey) ?? [];
    list.push(e);
    equipmentByType.set(e.typeKey, list);
  }
  const vessels = equipment.filter((e) => e.vesselId);

  // MbprNoteType is not a static record — seed a small themed set first.
  const noteTypeIdByKey = new Map(MBPR_NOTE_TYPES.map((t) => [t.key, uuid()]));
  await insert(
    'mbprNoteType',
    MBPR_NOTE_TYPES.map((t) => ({
      id: noteTypeIdByKey.get(t.key)!,
      name: t.name,
      description: t.description,
      bgColor: t.bgColor,
      textColor: t.textColor,
    })),
  );

  const mbprRows: any[] = [];
  const batchSizeRows: any[] = [];
  const stepRows: any[] = [];
  const instructionRows: any[] = [];
  const stepEquipmentRows: any[] = [];
  const stepActionableRows: any[] = [];
  const stepAddendumRows: any[] = [];
  const bomRows: any[] = [];
  const bsvRows: any[] = [];
  const mbprNoteRows: any[] = [];

  const result: DemoMbpr[] = [];

  for (const recipe of RECIPES) {
    const item = producedByName.get(recipe.producedItemName);
    if (!item) {
      throw new Error(`😭 recipe references unknown produced item "${recipe.producedItemName}". Check data/items.ts.`);
    }

    const mbprId = uuid();
    const createdAt = randomPastDate(120, 320);
    mbprRows.push({
      id: mbprId,
      producesItemId: item.id,
      recordStatusId: recordActive(),
      versionLabel: recipe.versionLabel,
      estimatedTotalTime: recipe.estimatedTotalTime,
      ...stamp(createdAt),
    });

    // a couple of recipe notes
    for (const noteAt of spreadDates(createdAt, new Date(), chance(0.7) ? 2 : 1)) {
      mbprNoteRows.push({
        id: uuid(),
        mbprId,
        noteTypeId: pick(Array.from(noteTypeIdByKey.values())),
        userId: pick(users).id,
        content: pick(MBPR_NOTES),
        ...stamp(noteAt),
      });
    }

    // batch sizes + vessel links
    const batchSizes = recipe.batchSizes.map((quantity) => ({ id: uuid(), quantity }));
    for (const bs of batchSizes) {
      batchSizeRows.push({
        id: bs.id,
        mbprId,
        quantity: bs.quantity,
        uomId: poundsUom(),
        recordStatusId: recordActive(),
        ...stamp(createdAt),
      });
      const fitting = vessels.filter(
        (v) => v.vessel && bs.quantity >= v.vessel.capacityMinimum && bs.quantity <= v.vessel.capacityMaximum,
      );
      const chosen = (fitting.length ? fitting : vessels).slice(0, 2);
      for (const v of chosen) {
        bsvRows.push({
          id: uuid(),
          tankTime: randFloat(15, 90),
          compoundingVesselId: v.vesselId!,
          batchSizeId: bs.id,
          ...stamp(createdAt),
        });
      }
    }

    // steps + their children
    const steps: { id: string; actionableIds: string[] }[] = [];
    const bomLines: { id: string; itemId: string; concentration: number }[] = [];
    recipe.steps.forEach((step, idx) => {
      const stepId = uuid();
      stepRows.push({
        id: stepId,
        mbprId,
        sequence: idx + 1,
        phase: step.phase,
        label: step.label,
        recordStatusId: recordActive(),
        ...stamp(createdAt),
      });

      for (const instruction of step.instructions) {
        instructionRows.push({
          id: uuid(),
          stepId,
          instructionContent: instruction,
          recordStatusId: recordActive(),
          ...stamp(createdAt),
        });
      }

      for (const typeKey of step.equipmentTypeKeys) {
        const options = equipmentByType.get(typeKey);
        if (!options || options.length === 0) {
          throw new Error(`😭 recipe step references unknown equipment type "${typeKey}". Check data/equipment.ts.`);
        }
        stepEquipmentRows.push({
          id: uuid(),
          stepId,
          equipmentId: pick(options).id,
          recordStatusId: recordActive(),
          ...stamp(createdAt),
        });
      }

      const actionableIds: string[] = [];
      step.actionableTypeKeys.forEach((key, aIdx) => {
        const actionableTypeId = (refs.stepActionableTypes as Record<string, string>)[key];
        if (!actionableTypeId) {
          throw new Error(`😭 recipe step references unknown actionable type "${key}". Check refs.stepActionableTypes.`);
        }
        const actionableId = uuid();
        actionableIds.push(actionableId);
        stepActionableRows.push({
          id: actionableId,
          stepId,
          actionableTypeId,
          required: true,
          verificationRequired: aIdx === 0,
          secondaryVerificationRequired: false,
          recordStatusId: recordActive(),
          ...stamp(createdAt),
        });
      });
      steps.push({ id: stepId, actionableIds });

      for (const addendum of step.addendums ?? []) {
        stepAddendumRows.push({
          id: uuid(),
          stepId,
          addendumTypeId: (refs.stepAddendumTypes as Record<string, string>)[addendum.typeKey],
          content: addendum.content,
          recordStatusId: recordActive(),
          ...stamp(createdAt),
        });
      }

      step.ingredients.forEach((line, bIdx) => {
        const ingredient = ingredientByName.get(line.ingredientName);
        if (!ingredient) {
          throw new Error(`😭 recipe "${recipe.producedItemName}" references unknown ingredient "${line.ingredientName}". Check data/items.ts.`);
        }
        const bomId = uuid();
        bomLines.push({ id: bomId, itemId: ingredient.id, concentration: line.concentration });
        bomRows.push({
          id: bomId,
          itemId: ingredient.id,
          mbprId,
          stepId,
          identifier: `BOM-${idx + 1}.${bIdx + 1}`,
          concentration: line.concentration,
          recordStatusId: recordActive(),
          ...stamp(createdAt),
        });
      });
    });

    result.push({
      id: mbprId,
      versionLabel: recipe.versionLabel,
      producesItem: { id: item.id, referenceCode: item.referenceCode },
      batchSizes,
      steps,
      bomLines,
    });
  }

  // insert in FK-safe order
  await insert('masterBatchProductionRecord', mbprRows);
  await insert('batchSize', batchSizeRows);
  await insert('batchStep', stepRows);
  await insert('stepInstruction', instructionRows);
  await insert('stepEquipment', stepEquipmentRows);
  await insert('stepActionable', stepActionableRows);
  await insert('stepAddendum', stepAddendumRows);
  await insert('billOfMaterial', bomRows);
  await insert('batchSizeCompoundingVessel', bsvRows);
  await insert('mbprNote', mbprNoteRows);

  return result;
};
