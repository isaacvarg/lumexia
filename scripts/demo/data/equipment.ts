// Equipment & compounding vessels for the Portals & Paws back-of-house. None of
// these tables are seeded at init, so the demo creates the types, the equipment, and
// the vessel records. Vessels are equipment that also hold a batch (kettles, tanks).

export interface EquipmentTypeData {
  key: string;
  name: string;
}

export const EQUIPMENT_TYPES: ReadonlyArray<EquipmentTypeData> = [
  { key: 'espressoMachine', name: 'Espresso Machine' },
  { key: 'convectionOven', name: 'Convection Oven' },
  { key: 'standMixer', name: 'Stand Mixer' },
  { key: 'compoundingKettle', name: 'Compounding Kettle' },
  { key: 'teaUrn', name: 'Tea Urn' },
  { key: 'blastChiller', name: 'Blast Chiller' },
  { key: 'proofingCabinet', name: 'Proofing Cabinet' },
  { key: 'workTable', name: 'Work Table' },
  { key: 'benchScale', name: 'Bench Scale' },
];

export interface EquipmentData {
  name: string;
  typeKey: string;
  // present when this equipment is also a compounding vessel
  vessel?: { capacityMinimum: number; capacityMaximum: number; operationalCost: number };
}

export const EQUIPMENT: ReadonlyArray<EquipmentData> = [
  { name: 'Stainless the Warforged Espresso Engine', typeKey: 'espressoMachine' },
  { name: 'Little Brass Espresso Pulley', typeKey: 'espressoMachine' },
  { name: 'Brimstone Convection Oven #1', typeKey: 'convectionOven' },
  { name: 'Brimstone Convection Oven #2', typeKey: 'convectionOven' },
  { name: 'Gnomish Geared Stand Mixer', typeKey: 'standMixer' },
  { name: 'Penelope’s Patented Whisk-o-Matic', typeKey: 'standMixer' },
  { name: 'Feywild Copper Compounding Kettle', typeKey: 'compoundingKettle', vessel: { capacityMinimum: 10, capacityMaximum: 80, operationalCost: 4.5 } },
  { name: 'Underdark Cast-Iron Compounding Kettle', typeKey: 'compoundingKettle', vessel: { capacityMinimum: 25, capacityMaximum: 150, operationalCost: 6.25 } },
  { name: 'Astral Steeping Tea Urn', typeKey: 'teaUrn', vessel: { capacityMinimum: 5, capacityMaximum: 60, operationalCost: 2.75 } },
  { name: 'Chionthar Blast Chiller', typeKey: 'blastChiller' },
  { name: 'Goodberry Proofing Cabinet', typeKey: 'proofingCabinet' },
  { name: 'Lower Ward Stainless Work Table', typeKey: 'workTable' },
  { name: 'Modron-Calibrated Bench Scale', typeKey: 'benchScale' },
];
