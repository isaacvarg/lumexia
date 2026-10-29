// Pure rules for importing a supplier COA into lot quality results: matching names, reading the limits a
// COA prints, comparing a result to them, and deciding which rows a person must look at.

export type SpecificationType = "range" | "max" | "min";
export type ParsedSpecification = { type: SpecificationType; valueA: string; valueB: string | null };
export type Outcome = "pass" | "fail";

// Case, spacing and punctuation don't make a different test: "Acid Value" and "acid-value." are the same.
export const normalizeTestName = (name: string) => name.toLowerCase().replace(new RegExp("[^\\p{L}\\p{N}]+", "gu"), "");

export const normalizeUnit = (unit: string | null | undefined) => (unit ?? "").toLowerCase().replace(/\s+/g, "").replace(/[µμ]/g, "u");

const NUMBER = String.raw`[-+]?\d+(?:[.,]\d+)?`;
const toNumber = (text: string) => Number(text.replace(",", "."));

// A result that is only a number. "<0.1", "ND" and "Conforms" are text.
export const parseResultNumber = (result: string): number | null => {
  const match = result.trim().match(new RegExp(`^(${NUMBER})(?:\\s*(?:%|[a-zA-Zµμ°/]+[a-zA-Z0-9µμ°/. ]*))?$`));
  if (!match) return null;
  const n = toNumber(match[1]);
  return Number.isFinite(n) ? n : null;
};

// "5.0 - 7.0", "5.0–7.0 %", "≤ 0.5", "NMT 0.5 ppm", "max 0.5", "≥ 98", "NLT 98", "> 98". Anything else
// ("Conforms", "White powder", "Report") has no limit we can compare.
export const parseSpecification = (text: string | null | undefined): ParsedSpecification | null => {
  const s = (text ?? "").trim();
  if (!s) return null;
  const range = s.match(new RegExp(`^(${NUMBER})\\s*(?:-|–|—|to)\\s*(${NUMBER})(?!\\d)`, "i"));
  if (range) {
    const [a, b] = [toNumber(range[1]), toNumber(range[2])];
    if (a <= b) return { type: "range", valueA: String(a), valueB: String(b) };
  }
  const max = s.match(new RegExp(`^(?:≤|<=|<|nmt|max(?:imum)?\\.?|not more than)\\s*(${NUMBER})`, "i"));
  if (max) return { type: "max", valueA: String(toNumber(max[1])), valueB: null };
  const min = s.match(new RegExp(`^(?:≥|>=|>|nlt|min(?:imum)?\\.?|not less than)\\s*(${NUMBER})`, "i"));
  if (min) return { type: "min", valueA: String(toNumber(min[1])), valueB: null };
  return null;
};

export type SpecificationLike = { specificationType: string; valueA: string; valueB: string | null };

// null when we can't tell: no spec, a spec that isn't numeric, or a result that isn't a plain number.
export const computeOutcome = (spec: SpecificationLike | null, result: string): Outcome | null => {
  if (!spec) return null;
  const value = parseResultNumber(result);
  if (value === null) return null;
  const a = toNumber(spec.valueA);
  const b = spec.valueB === null ? null : toNumber(spec.valueB);
  if (!Number.isFinite(a) || (b !== null && !Number.isFinite(b))) return null;
  if (spec.specificationType === "range" && b !== null) return value >= a && value <= b ? "pass" : "fail";
  if (spec.specificationType === "max") return value <= a ? "pass" : "fail";
  if (spec.specificationType === "min") return value >= a ? "pass" : "fail";
  return null;
};

// No conversion: only the same unit (or a side that didn't print one) is compared.
export const unitsComparable = (resultUnit: string | null | undefined, parameterUom: string | null | undefined) => {
  const [a, b] = [normalizeUnit(resultUnit), normalizeUnit(parameterUom)];
  return !a || !b || a === b;
};

export const reviewReasons = {
  lowConfidence: "lowConfidence",
  needsHumanCheck: "needsHumanCheck",
  newParameter: "newParameter",
  outcomeDisagreement: "outcomeDisagreement",
  unitMismatch: "unitMismatch",
  extraTest: "extraTest",
} as const;
export type ReviewReason = (typeof reviewReasons)[keyof typeof reviewReasons];

export type OutcomeSet = { computed: Outcome | null; suggested: Outcome | null; supplier: Outcome | null };

// Ours wins when we can compute it; Hermes's suggestion only fills in when we can't. The supplier's printed
// outcome is evidence, never the verdict.
export const effectiveOutcome = ({ computed, suggested }: OutcomeSet): Outcome | null => computed ?? suggested;

export const outcomesDisagree = ({ computed, suggested, supplier }: OutcomeSet) => new Set([computed, suggested, supplier].filter(Boolean)).size > 1;

// Fact confidence is high | medium | low; only a high-confidence reading is accepted without a look.
export const decideReview = (input: {
  confidence: string;
  needsHumanCheck: boolean;
  newParameter: boolean;
  outcomes: OutcomeSet;
  unitMismatch: boolean;
  extraTest: boolean;
}): { reviewState: "accepted" | "needsReview"; reasons: ReviewReason[] } => {
  const reasons: ReviewReason[] = [];
  if (input.confidence !== "high") reasons.push(reviewReasons.lowConfidence);
  if (input.needsHumanCheck) reasons.push(reviewReasons.needsHumanCheck);
  if (input.newParameter) reasons.push(reviewReasons.newParameter);
  if (outcomesDisagree(input.outcomes)) reasons.push(reviewReasons.outcomeDisagreement);
  if (input.unitMismatch) reasons.push(reviewReasons.unitMismatch);
  if (input.extraTest) reasons.push(reviewReasons.extraTest);
  return { reviewState: reasons.length ? "needsReview" : "accepted", reasons };
};

// The dry record's verdict once every row is in. null leaves it open.
export const recordVerdict = (input: { baselineApproved: boolean; outcomes: (Outcome | null)[]; missingTests: number }): "pass" | "outOfSpecification" | null => {
  if (!input.baselineApproved) return null;
  if (input.outcomes.includes("fail")) return "outOfSpecification";
  if (input.missingTests > 0 || input.outcomes.includes(null)) return null;
  return "pass";
};
