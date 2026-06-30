// Data for the quality (QC) layer: the organoleptic / visual parameters the café
// checks, the templates and parameter groups built from them, the item-type → template
// mapping that decides which parameters get assigned to each item, and flavor text for
// examination notes.

// `dataType` is a key into refs.qcDataTypes; `uom` is free-text ("NA" = not applicable).
export interface QcParameterData {
  name: string;
  description: string;
  uom: string;
  dataType: 'number' | 'text' | 'integer' | 'boolean';
  isWetParameter: boolean;
}

export const QC_PARAMETERS: ReadonlyArray<QcParameterData> = [
  { name: 'Smell', description: "Organoleptic measurement using the good ol' olfactory sense", uom: 'NA', dataType: 'boolean', isWetParameter: true },
  { name: 'Taste', description: 'Organoleptic measurement using your mouth', uom: 'NA', dataType: 'boolean', isWetParameter: true },
  { name: 'Clarity', description: 'Is it clear', uom: 'NA', dataType: 'boolean', isWetParameter: true },
  { name: 'Color', description: 'Does the color look right', uom: 'NA', dataType: 'boolean', isWetParameter: true },
  { name: 'pH', description: 'Measurement of free hydrogen ions in solution', uom: 'Unitless', dataType: 'integer', isWetParameter: true },
  { name: 'Visual', description: "Does it look the way its supposed to", uom: 'NA', dataType: 'boolean', isWetParameter: false },
];

export interface QcTemplateData {
  name: string;
  description: string;
  parameters: string[]; // parameter names
}

export const QC_TEMPLATES: ReadonlyArray<QcTemplateData> = [
  { name: 'General QC', description: 'What we like doing before sending out large batches', parameters: ['Smell', 'Taste', 'Clarity', 'Color', 'pH', 'Visual'] },
  { name: 'Taste Test', description: 'Just a quick random check', parameters: ['Taste'] },
  { name: 'Incoming Ingredients', description: 'Check to ensure our ingredients are acceptable', parameters: ['Taste', 'Smell', 'Color'] },
  { name: 'Incoming Visual', description: 'Check to ensure everything looks good with a procured item', parameters: ['Visual'] },
];

export interface QcParameterGroupData {
  name: string;
  abbreviation: string;
  examinationType: 'dry' | 'inProcess' | 'finishedProduct'; // key into refs.qcExaminationTypes
  parameters: string[]; // parameter names
}

export const QC_PARAMETER_GROUPS: ReadonlyArray<QcParameterGroupData> = [
  { name: 'Quick Conformity Check', abbreviation: 'QCC', examinationType: 'inProcess', parameters: ['pH', 'Color', 'Taste', 'Smell'] },
  { name: 'Finished Good QC', abbreviation: 'FGQC', examinationType: 'finishedProduct', parameters: ['Smell', 'Taste', 'Clarity', 'Color', 'pH', 'Visual'] },
  { name: 'Incoming Visual', abbreviation: 'INVI', examinationType: 'dry', parameters: ['Visual'] },
];

// which template's parameters get assigned to an item, keyed by DemoItem.type. Any item
// type not listed here falls back to DEFAULT_TEMPLATE ("everything else").
export const ITEM_TYPE_TEMPLATE: Readonly<Record<string, string>> = {
  Ingredients: 'Incoming Ingredients',
  Recipes: 'General QC',
};

export const DEFAULT_TEMPLATE = 'Incoming Visual';

// reused, non-unique flavor text for examination notes (cat-café / planar voice).
export const QC_EXAMINATION_NOTES: ReadonlyArray<string> = [
  'Aroma is bright and on-profile — no off notes.',
  'Tasted clean, well within our usual range.',
  'Color matches the reference swatch nicely.',
  'Clarity looks great, no haze or sediment.',
  'pH sat comfortably in spec on the first read.',
  'Visual inspection passed — packaging intact, no damage.',
  'Second run confirmed the first, batch looks solid.',
  'Smelled lovely, the lavender note really comes through.',
  'Everything checks out, cleared for the floor.',
  'Looks and tastes exactly how Morgra likes it.',
];
