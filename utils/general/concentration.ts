// Concentration is stored as a fraction 0..1 in the DB and displayed as a
// percentage 0..100 in the UI.

export const fractionToPercent = (fraction: number): string => {
  const pct = fraction * 100;
  // strip trailing zeros, keep up to 2 decimal places
  return pct.toFixed(2).replace(/\.?0+$/, "");
};

export const percentToFraction = (pct: number): number => pct / 100;
