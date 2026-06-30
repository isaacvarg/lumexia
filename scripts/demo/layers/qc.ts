import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { chance, pick, randInt, randomPastDate, spreadDates, stamp } from '../lib/timeline';
import {
  QC_PARAMETERS,
  QC_TEMPLATES,
  QC_PARAMETER_GROUPS,
  ITEM_TYPE_TEMPLATE,
  DEFAULT_TEMPLATE,
  QC_EXAMINATION_NOTES,
} from '../data/qc';
import { DemoItem } from './items';
import { DemoLot } from './purchaseOrders';
import { DemoBprLot } from './bprs';
import { DemoUser } from './users';

const dataTypeId = (key: string): string => (refs.qcDataTypes as Record<string, string>)[key];
const examTypeId = (key: string): string => (refs.qcExaminationTypes as Record<string, string>)[key];

// pass/fail criteria per data type: booleans must read "true"; pH (integer) must land in 6–8.
const specForDataType = (dataType: string): { specificationType: string; valueA: string; valueB: string | null } =>
  dataType === 'boolean'
    ? { specificationType: 'single', valueA: 'true', valueB: null }
    : { specificationType: 'range', valueA: '6', valueB: '8' };

// seeds the quality module: parameters, templates, parameter groups, per-item parameter
// assignments (+ specifications), and passing examinations against incoming purchased lots
// (dry) and recipe output lots (in-process + finished product).
export const seedQc = async (
  items: DemoItem[],
  poLots: DemoLot[],
  bprLots: DemoBprLot[],
  users: DemoUser[],
): Promise<void> => {
  // ── parameters ────────────────────────────────────────────────────────────
  const paramIdByName = new Map<string, string>();
  const paramDataTypeByName = new Map<string, string>();
  const parameterRows = QC_PARAMETERS.map((p) => {
    const id = uuid();
    paramIdByName.set(p.name, id);
    paramDataTypeByName.set(p.name, p.dataType);
    return {
      id,
      name: p.name,
      uom: p.uom,
      dataTypeId: dataTypeId(p.dataType),
      description: p.description,
      isWetParameter: p.isWetParameter,
      ...stamp(randomPastDate(60, 120)),
    };
  });

  // ── templates ─────────────────────────────────────────────────────────────
  const templateRows: any[] = [];
  const templateParameterRows: any[] = [];
  for (const t of QC_TEMPLATES) {
    const templateId = uuid();
    const createdAt = randomPastDate(50, 110);
    templateRows.push({ id: templateId, name: t.name, description: t.description, ...stamp(createdAt) });
    for (const pname of t.parameters) {
      templateParameterRows.push({ id: uuid(), templateId, parameterId: paramIdByName.get(pname)!, ...stamp(createdAt) });
    }
  }
  const templateParamsByName = new Map(QC_TEMPLATES.map((t) => [t.name, t.parameters]));

  // ── parameter groups ──────────────────────────────────────────────────────
  const groupRows: any[] = [];
  const groupParameterRows: any[] = [];
  for (const g of QC_PARAMETER_GROUPS) {
    const groupId = uuid();
    const createdAt = randomPastDate(50, 110);
    groupRows.push({
      id: groupId,
      name: g.name,
      abbreviation: g.abbreviation,
      examinationTypeId: examTypeId(g.examinationType),
      ...stamp(createdAt),
    });
    for (const pname of g.parameters) {
      groupParameterRows.push({ id: uuid(), groupId, parameterId: paramIdByName.get(pname)!, ...stamp(createdAt) });
    }
  }

  // ── item parameters + specifications ──────────────────────────────────────
  // itemId -> (paramName -> itemParameterId), so examinations can attach results.
  const itemParamIds = new Map<string, Map<string, string>>();
  const itemParameterRows: any[] = [];
  const specRows: any[] = [];

  for (const item of items) {
    const templateName = ITEM_TYPE_TEMPLATE[item.type] ?? DEFAULT_TEMPLATE;
    const paramNames = templateParamsByName.get(templateName) ?? [];
    const isRecipe = item.type === 'Recipes';
    const examKeys = isRecipe ? ['inProcess', 'finishedProduct'] : ['dry'];
    const createdAt = randomPastDate(40, 100);

    const nameToId = new Map<string, string>();
    for (const pname of paramNames) {
      const itemParameterId = uuid();
      nameToId.set(pname, itemParameterId);
      itemParameterRows.push({ id: itemParameterId, itemId: item.id, parameterId: paramIdByName.get(pname)!, ...stamp(createdAt) });

      const spec = specForDataType(paramDataTypeByName.get(pname)!);
      for (const examKey of examKeys) {
        specRows.push({
          id: uuid(),
          itemParameterId,
          examinationTypeId: examTypeId(examKey),
          name: pname,
          valueA: spec.valueA,
          valueB: spec.valueB,
          specificationType: spec.specificationType,
          displayOnCoa: true,
          ...stamp(createdAt),
        });
      }
    }
    itemParamIds.set(item.id, nameToId);
  }

  // ── examinations (records + results + notes) ──────────────────────────────
  const recordRows: any[] = [];
  const resultRows: any[] = [];
  const noteRows: any[] = [];

  const passingValue = (pname: string): string =>
    paramDataTypeByName.get(pname) === 'boolean' ? 'true' : String(randInt(6, 8));

  const buildExam = (
    lotId: string,
    itemId: string,
    examKey: string,
    examinedAt: Date,
    link: { linkedPurchaseOrderItemId?: string; linkedBprId?: string },
  ): void => {
    const nameToId = itemParamIds.get(itemId);
    if (!nameToId || nameToId.size === 0) return; // item has no assigned params

    const recordId = uuid();
    recordRows.push({
      id: recordId,
      conductedById: pick(users).id,
      statusId: refs.qcRecordStatuses.pass,
      examinationTypeId: examTypeId(examKey),
      examinedLotId: lotId,
      linkedPurchaseOrderItemId: link.linkedPurchaseOrderItemId ?? null,
      linkedBprId: link.linkedBprId ?? null,
      ...stamp(examinedAt),
    });

    // a quarter of records re-run a few parameters (2–3 runs); all runs still pass
    const multiRun = chance(0.25);
    for (const [pname, itemParameterId] of Array.from(nameToId)) {
      const runs = multiRun && chance(0.5) ? randInt(2, 3) : 1;
      for (let run = 1; run <= runs; run++) {
        resultRows.push({
          id: uuid(),
          qcRecordId: recordId,
          qcItemParameterId: itemParameterId,
          value: passingValue(pname),
          runNumber: run,
          ...stamp(examinedAt),
        });
      }
    }

    const noteCount = chance(0.7) ? randInt(1, 2) : 0;
    for (let n = 0; n < noteCount; n++) {
      noteRows.push({
        id: uuid(),
        recordId,
        noteTypeId: refs.qcRecordNoteTypes.general,
        userId: pick(users).id,
        content: pick(QC_EXAMINATION_NOTES),
        ...stamp(examinedAt),
      });
    }
  };

  // incoming purchased lots → one dry examination each, linked to the PO line
  for (const lot of poLots) {
    buildExam(lot.id, lot.itemId, 'dry', lot.createdAt, { linkedPurchaseOrderItemId: lot.poItemId });
  }

  // recipe output lots (completed batches) → in-process + finished-product, linked to the BPR
  for (const lot of bprLots) {
    if (!lot.isDone) continue;
    buildExam(lot.id, lot.itemId, 'inProcess', lot.createdAt, { linkedBprId: lot.bprId });
    buildExam(lot.id, lot.itemId, 'finishedProduct', lot.completedAt ?? lot.createdAt, { linkedBprId: lot.bprId });
  }

  // insert FK-safe: parameters → templates/groups (+ joins) → item params → specs → records → results → notes
  await insert('qcParameter', parameterRows);
  await insert('qcTemplate', templateRows);
  await insert('qcTemplateParameter', templateParameterRows);
  await insert('qcParameterGroup', groupRows);
  await insert('qcGroupParameter', groupParameterRows);
  await insert('qcItemParameter', itemParameterRows);
  await insert('qcItemSpecification', specRows);
  await insert('qcRecord', recordRows);
  await insert('qcParameterResult', resultRows);
  await insert('qcRecordNote', noteRows);
};
