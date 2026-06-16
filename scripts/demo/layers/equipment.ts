import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { EQUIPMENT, EQUIPMENT_TYPES } from '../data/equipment';

export interface DemoEquipment {
  id: string;
  typeKey: string;
  name: string;
  vesselId?: string; // compoundingVessel id when this equipment is a vessel
  vessel?: { capacityMinimum: number; capacityMaximum: number };
}

// seeds equipment types, equipment, and the compounding vessels that some equipment
// double as. Returns the equipment instances so MBPR steps can link equipment and
// batch sizes can link vessels.
export const seedEquipment = async (): Promise<DemoEquipment[]> => {
  const typeIdByKey = new Map(EQUIPMENT_TYPES.map((t) => [t.key, uuid()]));

  await insert(
    'equipmentType',
    EQUIPMENT_TYPES.map((t) => ({ id: typeIdByKey.get(t.key)!, name: t.name })),
  );

  const equipment: DemoEquipment[] = EQUIPMENT.map((e) => ({
    id: uuid(),
    typeKey: e.typeKey,
    name: e.name,
    vessel: e.vessel ? { capacityMinimum: e.vessel.capacityMinimum, capacityMaximum: e.vessel.capacityMaximum } : undefined,
    vesselId: e.vessel ? uuid() : undefined,
  }));

  await insert(
    'equipment',
    equipment.map((e, i) => ({
      id: e.id,
      name: e.name,
      identifier: `EQ-${(i + 1).toString().padStart(3, '0')}`,
      equipmentTypeId: typeIdByKey.get(e.typeKey)!,
    })),
  );

  const vesselRows = equipment
    .map((eq, i) => ({ eq, vessel: EQUIPMENT[i].vessel }))
    .filter(({ vessel }) => !!vessel)
    .map(({ eq, vessel }) => ({
      id: eq.vesselId!,
      equipmentId: eq.id,
      capacityMinimum: vessel!.capacityMinimum,
      capacityMaximum: vessel!.capacityMaximum,
      operationalCost: vessel!.operationalCost,
    }));

  await insert('compoundingVessel', vesselRows);

  return equipment;
};
