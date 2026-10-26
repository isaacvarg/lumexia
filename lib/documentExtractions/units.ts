// Converts numbers into each unit family's canonical unit, so "flashpoint < 60 °C" finds sheets printed
// in °F too. Units outside the table are kept as printed and simply left out of numeric search.

type Converter = (value: number) => number;

const identity: Converter = (v) => v;

const families: Record<string, { canonical: string; units: Record<string, Converter> }> = {
  temperature: {
    canonical: "°C",
    units: {
      c: identity,
      degc: identity,
      celsius: identity,
      f: (v) => ((v - 32) * 5) / 9,
      degf: (v) => ((v - 32) * 5) / 9,
      fahrenheit: (v) => ((v - 32) * 5) / 9,
      k: (v) => v - 273.15,
      kelvin: (v) => v - 273.15,
    },
  },
  density: {
    canonical: "g/mL",
    units: {
      "g/ml": identity,
      "g/cm3": identity,
      "g/cc": identity,
      "kg/l": identity,
      "kg/m3": (v) => v / 1000,
      "g/l": (v) => v / 1000,
      "lb/gal": (v) => v * 0.119826,
      "lbs/gal": (v) => v * 0.119826,
    },
  },
  concentration: {
    canonical: "%",
    units: {
      "%": identity,
      "%w/w": identity,
      "%wt": identity,
      "wt%": identity,
      "%w/v": identity,
      "%v/v": identity,
      percent: identity,
      ppm: (v) => v / 10_000,
      "mg/kg": (v) => v / 10_000,
      "g/kg": (v) => v / 10,
      ppb: (v) => v / 10_000_000,
    },
  },
  dose: {
    canonical: "mg/kg",
    units: {
      "mg/kg": identity,
      "mg/kgbw": identity,
      "mg/kgbodyweight": identity,
      "g/kg": (v) => v * 1000,
      "µg/kg": (v) => v / 1000,
      "ug/kg": (v) => v / 1000,
    },
  },
};

export const unitFamilies = Object.keys(families);

export const canonicalUnit = (family: string | null | undefined) => (family ? families[family]?.canonical ?? null : null);

// "° C", "deg. F", "g/cm³", "% w/w" → "c", "degf", "g/cm3", "%w/w"
const squashUnit = (unit: string) =>
  unit
    .toLowerCase()
    .replace(/³/g, "3")
    .replace(/[°º˚]/g, "")
    .replace(/\./g, "")
    .replace(/℃/g, "c")
    .replace(/℉/g, "f")
    .replace(/\s+/g, "");

// The value in the family's canonical unit, or null when the unit isn't known for that family.
export const toCanonical = (family: string, value: number, unit: string | null | undefined): number | null => {
  const entry = families[family];
  if (!entry || !Number.isFinite(value)) return null;
  if (!unit) return null;
  const convert = entry.units[squashUnit(unit)] ?? (squashUnit(unit) === squashUnit(entry.canonical) ? identity : undefined);
  if (!convert) return null;
  // keep results readable: 199 °F → 92.7778 °C, not 92.77777777777777
  return Math.round(convert(value) * 1e6) / 1e6;
};
