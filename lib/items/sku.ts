// SKU (item reference code) generation from an item type's prefix, e.g. RAW0001, FO0002.

export const SKU_MIN_DIGITS = 4;

// Uppercased, trimmed prefix; empty means "no prefix configured".
export const normalizeSkuPrefix = (prefix: string | null | undefined) => (prefix ?? "").trim().toUpperCase();

// Letters, digits and hyphens. It can't end in a digit, or "RAW1" + "0001" would be ambiguous.
export const skuPrefixError = (prefix: string): string | null => {
  if (prefix === "") return null;
  if (!/^[A-Z0-9-]+$/.test(prefix)) return "SKU prefixes may only contain letters, numbers and hyphens.";
  if (/\d$/.test(prefix)) return "SKU prefixes can't end with a number.";
  return null;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The lowest free PREFIX<number> given existingCodes (case-insensitive), padded to minDigits.
// Existing codes aren't sequential (RAW9985 and RAW0080 both exist), so "highest + 1" would
// spill into extra digits almost at once; filling the lowest gap keeps codes at minDigits until
// every number at that width is taken, then grows a digit. A number counts as taken whatever
// its padding (RAW00084 takes 84), so the result never reads like an existing code.
export const nextSku = (prefix: string, existingCodes: string[], minDigits = SKU_MIN_DIGITS) => {
  const pattern = new RegExp(`^${escapeRegex(prefix)}(\\d+)$`, "i");
  const taken = new Set<number>();
  for (const code of existingCodes) {
    const match = pattern.exec(code.trim());
    if (match) taken.add(Number(match[1]));
  }
  let n = 1;
  while (taken.has(n)) n++;
  return `${prefix}${String(n).padStart(minDigits, "0")}`;
};
