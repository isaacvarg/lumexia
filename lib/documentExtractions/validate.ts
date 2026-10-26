import { canonicalUnit, toCanonical } from "./units";
import {
  claimStatuses,
  type ColumnSchema,
  type FactDefinitionShape,
  type FactInput,
  type PreparedFact,
  type ValueType,
} from "./types";

// Checks a fact an agent sent against its catalog key and works out what to store: the value in its
// shape, a printed form for text search, and the bounds in the key's canonical unit for numeric search.
// Pure, so it's tested without a database.

export type FactCheck = { fact: PreparedFact; warnings: string[] } | { errors: string[] };

const CAS_PATTERN = /^(\d{2,7})-(\d{2})-(\d)$/;

// CAS numbers end in a check digit; a typo on the sheet usually breaks it. Flagged, never rejected: the
// sheet is stored as printed and the contradiction goes in the extraction notes.
export const casCheckDigitOk = (cas: string) => {
  const match = CAS_PATTERN.exec(cas.trim());
  if (!match) return false;
  const digits = (match[1] + match[2]).split("").reverse();
  const sum = digits.reduce((total, d, i) => total + Number(d) * (i + 1), 0);
  return sum % 10 === Number(match[3]);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isIsoDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}(-\d{2})?$/.test(value);

// A number is a plain number or { value?, min?, max?, qualifier? }; returns its bounds.
const numberBounds = (value: unknown): { min: number; max: number } | null => {
  if (typeof value === "number" && Number.isFinite(value)) return { min: value, max: value };
  if (!isPlainObject(value)) return null;
  const { value: exact, min, max, qualifier } = value;
  const allowed = new Set(["value", "min", "max", "qualifier"]);
  if (Object.keys(value).some((k) => !allowed.has(k))) return null;
  if (qualifier !== undefined && typeof qualifier !== "string") return null;
  const nums = [exact, min, max].filter((n) => n !== undefined);
  if (nums.length === 0 || nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) return null;
  if (typeof exact === "number") return { min: exact, max: exact };
  const lo = typeof min === "number" ? min : (max as number);
  const hi = typeof max === "number" ? max : (min as number);
  return lo <= hi ? { min: lo, max: hi } : null;
};

const checkTyped = (type: ValueType, value: unknown, where: string, warnings: string[]): string | null => {
  switch (type) {
    case "text":
      return typeof value === "string" && value.trim() ? null : `${where} must be non-empty text`;
    case "number":
      return numberBounds(value) ? null : `${where} must be a number or { value | min | max, qualifier? }`;
    case "date":
      return isIsoDate(value) ? null : `${where} must be a date as YYYY-MM-DD (or YYYY-MM)`;
    case "boolean":
      return typeof value === "boolean" ? null : `${where} must be true or false`;
    case "cas":
      if (typeof value !== "string" || !CAS_PATTERN.test(value.trim())) return `${where} must be a CAS number like 56-81-5`;
      if (!casCheckDigitOk(value)) warnings.push(`${where} ${value} fails the CAS check digit; stored as printed`);
      return null;
  }
};

const checkColumn = (column: ColumnSchema, value: unknown, where: string, warnings: string[]): string | null => {
  if (column.type === "enum") {
    return typeof value === "string" && column.options?.includes(value) ? null : `${where} must be one of ${column.options?.join(", ")}`;
  }
  if (column.type === "list") {
    return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim())
      ? null
      : `${where} must be a non-empty list of text`;
  }
  return checkTyped(column.type, value, where, warnings);
};

const describeNumber = (value: unknown) => {
  if (typeof value === "number") return String(value);
  const v = value as { value?: number; min?: number; max?: number; qualifier?: string };
  const core = v.value !== undefined ? String(v.value) : v.min !== undefined && v.max !== undefined ? `${v.min}–${v.max}` : v.min !== undefined ? `≥ ${v.min}` : `≤ ${v.max}`;
  return v.qualifier ? `${core} ${v.qualifier}` : core;
};

// The text search matches on, when the agent didn't send the sheet's own wording.
const printedFrom = (definition: FactDefinitionShape, value: unknown, unit: string | null) => {
  switch (definition.kind) {
    case "scalar":
      if (definition.valueSchema.type === "number") return `${describeNumber(value)}${unit ? ` ${unit}` : ""}`;
      return String(value);
    case "enum":
      return String(value);
    case "claim":
      return (value as { status: string }).status;
    case "section":
      return (value as { empty: boolean }).empty ? "empty" : "present";
    case "row":
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : typeof v === "object" ? describeNumber(v) : String(v)}`)
        .join("; ");
  }
};

export const needsHumanCheckFor = (definition: Pick<FactDefinitionShape, "safetyRelevant">, method: string, requested?: boolean) =>
  ((method === "vision" || method === "ocr") && definition.safetyRelevant) || requested === true;

export const prepareFact = (definition: FactDefinitionShape, input: FactInput): FactCheck => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const where = `${definition.key}`;
  const schema = definition.valueSchema ?? {};
  let value = input.value;
  let bounds: { min: number; max: number } | null = null;

  if (input.method === "human") errors.push(`${where}: method human is only set by people in Lumexia`);
  if (!input.quote?.trim()) errors.push(`${where}: quote is required (the exact text on the sheet)`);

  const scope = input.scope ?? (input.component ? "component" : "material");
  const componentName = input.component?.name?.trim() || null;
  const componentCas = input.component?.cas?.trim() || null;
  if (scope === "component" && !componentName && !componentCas) errors.push(`${where}: a component fact needs component.name or component.cas`);
  if (scope === "material" && (componentName || componentCas)) errors.push(`${where}: component given but scope is material`);
  if (componentCas) {
    if (!CAS_PATTERN.test(componentCas)) errors.push(`${where}: component.cas must be a CAS number like 56-81-5`);
    else if (!casCheckDigitOk(componentCas)) warnings.push(`${where}: component CAS ${componentCas} fails the check digit; stored as printed`);
  }

  switch (definition.kind) {
    case "scalar": {
      const type = schema.type ?? "text";
      const problem = checkTyped(type, value, `${where} value`, warnings);
      if (problem) errors.push(problem);
      else if (type === "number") bounds = numberBounds(value);
      else if (typeof value === "string") value = value.trim();
      break;
    }
    case "enum":
      if (typeof value !== "string" || !schema.options?.includes(value)) errors.push(`${where} value must be one of ${schema.options?.join(", ")}`);
      break;
    case "claim":
      if (typeof value === "string") value = { status: value };
      if (!isPlainObject(value) || !claimStatuses.includes(value.status as never) || Object.keys(value).length !== 1) {
        errors.push(`${where} value must be { status: ${claimStatuses.join(" | ")} }`);
      }
      break;
    case "section":
      if (!isPlainObject(value) || typeof value.present !== "boolean" || typeof value.empty !== "boolean" || Object.keys(value).length !== 2) {
        errors.push(`${where} value must be { present: boolean, empty: boolean }`);
      } else if (!value.present && value.empty) {
        errors.push(`${where}: a section can't be empty and absent; use present: false, empty: false`);
      }
      break;
    case "row": {
      const columns = schema.columns ?? [];
      if (!isPlainObject(value)) {
        errors.push(`${where} value must be an object with columns ${columns.map((c) => c.name).join(", ")}`);
        break;
      }
      const known = new Set(columns.map((c) => c.name));
      const unknown = Object.keys(value).filter((k) => !known.has(k));
      if (unknown.length) errors.push(`${where}: unknown columns ${unknown.join(", ")} (columns: ${Array.from(known).join(", ")})`);
      const row: Record<string, unknown> = {};
      for (const column of columns) {
        const cell = value[column.name];
        if (cell === undefined || cell === null || cell === "") {
          if (column.required) errors.push(`${where}: column ${column.name} is required`);
          continue;
        }
        const problem = checkColumn(column, cell, `${where}.${column.name}`, warnings);
        if (problem) errors.push(problem);
        row[column.name] = typeof cell === "string" ? cell.trim() : cell;
      }
      value = row;
      if (schema.normalize && !errors.length) {
        const lo = numberBounds(row[schema.normalize.min]);
        const hi = schema.normalize.max ? numberBounds(row[schema.normalize.max]) : null;
        if (lo || hi) bounds = { min: (lo ?? hi)!.min, max: (hi ?? lo)!.max };
      }
      break;
    }
  }

  if (input.rowIndex !== undefined && (!Number.isInteger(input.rowIndex) || input.rowIndex < 0)) errors.push(`${where}: rowIndex must be a whole number from 0`);
  if (input.page?.index !== undefined && (!Number.isInteger(input.page.index) || input.page.index < 0)) errors.push(`${where}: page.index is the 0-based PDF page`);

  if (errors.length) return { errors };

  const unit = input.unit?.trim() || (bounds ? schema.defaultUnit ?? null : null);
  let normalizedValue: number | null = null;
  let normalizedMax: number | null = null;
  let normalizedUnit: string | null = null;
  if (bounds) {
    if (definition.unitFamily) {
      normalizedValue = toCanonical(definition.unitFamily, bounds.min, unit);
      normalizedMax = toCanonical(definition.unitFamily, bounds.max, unit);
      if (normalizedValue === null) warnings.push(`${where}: unit "${unit ?? ""}" isn't a known ${definition.unitFamily} unit; left out of numeric search`);
      else normalizedUnit = canonicalUnit(definition.unitFamily);
    } else {
      normalizedValue = bounds.min;
      normalizedMax = bounds.max;
    }
  }

  return {
    fact: {
      definitionId: definition.id,
      key: definition.key,
      scope,
      componentName,
      componentCas,
      value,
      printed: input.printed?.trim() || printedFrom(definition, value, unit),
      unit,
      normalizedValue,
      normalizedMax: normalizedValue === null ? null : normalizedMax,
      normalizedUnit,
      rowIndex: input.rowIndex ?? null,
      pageIndex: input.page?.index ?? null,
      pageLabel: input.page?.label?.trim() || null,
      quote: input.quote.trim(),
      method: input.method,
      confidence: input.confidence,
      needsHumanCheck: needsHumanCheckFor(definition, input.method, input.needsHumanCheck),
    },
    warnings,
  };
};
