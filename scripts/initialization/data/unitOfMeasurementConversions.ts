// Standard SI conversions between the mass units of measurement. These belong in
// initialization (not just the demo) because every deployment needs them: without a
// row here, converting a price/quantity between e.g. grams and pounds throws
// STANDARD_CONVERSION_NOT_FOUND (see utils/uom/convert.ts). conversionFactor multiplies
// a quantity in uomA to produce the quantity in uomB.
export const data = {
  modelName: 'unitOfMeasurementConversion',
  dependency: true,
  dependencies: ['uom'],
  generateStaticRecord: false, // no `name` column — don't emit a static record file
  seed: (deps: any) => {
    const { uom } = deps;
    return [
      { uomAId: uom.grams, uomBId: uom.pounds, conversionFactor: 0.00220462262 },
      { uomAId: uom.kilograms, uomBId: uom.pounds, conversionFactor: 2.2046226218 },
      { uomAId: uom.grams, uomBId: uom.kilograms, conversionFactor: 0.001 },
    ];
  },
};
