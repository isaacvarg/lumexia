import { factKinds, valueTypes, type FactKind, type ValueSchema } from "./types";
import { unitFamilies } from "./units";

// Rules for catalog keys an agent proposes: the key's format, a value schema that fits its kind, and a
// guard against near-duplicates (nano_free vs nanomaterial_free). Pure, so it's tested without a database.

export const KEY_PATTERN = /^[a-z][a-z0-9_]{1,62}$/;

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// crude stemming is enough to line up "statements"/"statement", "limits"/"limit"
const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));

const levenshtein = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
};

type Existing = { key: string; label: string; kind: string; status: string };

const similar = (a: string, b: string) => {
  const sa = squash(a);
  const sb = squash(b);
  if (!sa || !sb) return false;
  if (sa === sb) return true;
  const shorter = sa.length <= sb.length ? sa : sb;
  const longer = sa.length <= sb.length ? sb : sa;
  if (shorter.length >= 4 && longer.includes(shorter)) return true;
  if (levenshtein(sa, sb) <= Math.max(1, Math.floor(longer.length / 6))) return true;
  // word by word, where a word also matches a longer one it starts ("nano" ~ "nanomaterial")
  const wa = Array.from(new Set(words(a)));
  const wb = Array.from(new Set(words(b)));
  const matches = (x: string, y: string) => x === y || (Math.min(x.length, y.length) >= 4 && (x.startsWith(y) || y.startsWith(x)));
  const [fewer, more] = wa.length <= wb.length ? [wa, wb] : [wb, wa];
  const matched = fewer.filter((w) => more.some((m) => matches(w, m))).length;
  return more.length > 0 && matched / more.length >= 0.6;
};

// Existing keys a proposed key may duplicate, by key or label.
export const nearDuplicates = (proposed: { key: string; label: string }, existing: Existing[]) =>
  existing.filter((e) => e.key === proposed.key || similar(proposed.key, e.key) || similar(proposed.label, e.label));

const CASE_NOTE = "column names are lower_snake_case";

// Problems with a proposed value schema, or none.
export const valueSchemaProblems = (kind: FactKind, schema: ValueSchema, unitFamily?: string | null): string[] => {
  const problems: string[] = [];
  if (!factKinds.includes(kind)) return [`kind must be one of ${factKinds.join(", ")}`];
  if (unitFamily && !unitFamilies.includes(unitFamily)) problems.push(`unitFamily must be one of ${unitFamilies.join(", ")}`);
  switch (kind) {
    case "scalar":
      if (!schema.type || !valueTypes.includes(schema.type)) problems.push(`a scalar needs valueSchema.type: ${valueTypes.join(" | ")}`);
      if (unitFamily && schema.type !== "number") problems.push("only number scalars have a unit family");
      break;
    case "enum":
      if (!schema.options?.length || schema.options.some((o) => typeof o !== "string" || !o.trim())) problems.push("an enum needs valueSchema.options");
      break;
    case "row": {
      const columns = schema.columns ?? [];
      if (!columns.length) problems.push("a row needs valueSchema.columns");
      const names = new Set<string>();
      for (const column of columns) {
        if (!KEY_PATTERN.test(column.name ?? "")) problems.push(`column "${column.name}": ${CASE_NOTE}`);
        if (names.has(column.name)) problems.push(`column "${column.name}" appears twice`);
        names.add(column.name);
        if (![...valueTypes, "enum", "list"].includes(column.type)) problems.push(`column "${column.name}": type must be ${[...valueTypes, "enum", "list"].join(" | ")}`);
        if (column.type === "enum" && !column.options?.length) problems.push(`column "${column.name}": an enum column needs options`);
      }
      if (schema.normalize) {
        for (const ref of [schema.normalize.min, schema.normalize.max].filter(Boolean) as string[]) {
          if (columns.find((c) => c.name === ref)?.type !== "number") problems.push(`normalize.${ref} must name a number column`);
        }
      }
      if (!columns.some((c) => c.required)) problems.push("a row needs at least one required column");
      break;
    }
    case "claim":
    case "section":
      if (unitFamily) problems.push(`a ${kind} has no unit family`);
      break;
  }
  return problems;
};
