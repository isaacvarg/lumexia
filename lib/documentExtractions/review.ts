import type { ExtractionConflict, FactScope, ReviewState } from "./types";

// How far people have checked an extraction, what it's missing, and which checks survive a re-extraction.
// Pure, so it's tested without a database.

type ReviewFact = { state: string; method: string; verifiedAt: Date | string | null; safetyRelevant: boolean };

const isVerified = (f: ReviewFact) => f.method === "human" || !!f.verifiedAt;

// Safety-relevant facts decide the state; an extraction without any (a COA, say) is judged on all its facts.
export const computeReviewState = (facts: ReviewFact[]): ReviewState => {
  const active = facts.filter((f) => f.state === "active");
  const safety = active.filter((f) => f.safetyRelevant);
  const judged = safety.length ? safety : active;
  const verified = judged.filter(isVerified).length;
  if (judged.length > 0 && verified === judged.length) return "verified";
  return verified > 0 ? "partially_verified" : "unreviewed";
};

// Required keys (for the document types the content is filed as) with no active fact.
export const missingRequiredKeys = (requiredKeys: string[], facts: { key: string; state: string }[]) => {
  const present = new Set(facts.filter((f) => f.state === "active").map((f) => f.key));
  return Array.from(new Set(requiredKeys)).filter((k) => !present.has(k));
};

type MatchFact = {
  id: string;
  key: string;
  scope: FactScope | string;
  componentName: string | null;
  componentCas: string | null;
  value: unknown;
  normalizedValue: number | null;
  pageIndex: number | null;
};

// Same key, same component, same value and same page: a person's check of the old fact still holds.
export const factIdentity = (f: Omit<MatchFact, "id">) =>
  [
    f.key,
    f.scope,
    (f.componentCas ?? "").trim(),
    (f.componentName ?? "").trim().toLowerCase(),
    f.normalizedValue ?? stableStringify(f.value),
    f.pageIndex ?? "",
  ].join("|");

// Facts that describe the same thing even if the value changed, to say "changed" rather than "missing".
const factSubject = (f: MatchFact) =>
  [f.key, f.scope, (f.componentCas ?? "").trim(), (f.componentName ?? "").trim().toLowerCase()].join("|");

export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
};

type VerifiedFact = MatchFact & { verifiedById: string | null; verifiedAt: Date | string | null };

// Which new facts inherit a verification, and which verified facts the new extraction changed or dropped.
// Each old fact is matched at most once, so two identical rows don't both inherit one check.
export const carryVerification = (previousVerified: VerifiedFact[], next: MatchFact[]) => {
  const inherits = new Map<string, VerifiedFact>();
  const unmatched = new Map<string, VerifiedFact[]>();
  for (const old of previousVerified) {
    const id = factIdentity(old);
    unmatched.set(id, [...(unmatched.get(id) ?? []), old]);
  }
  for (const fact of next) {
    const candidates = unmatched.get(factIdentity(fact));
    const old = candidates?.shift();
    if (old) inherits.set(fact.id, old);
  }

  const claimed = new Set(Array.from(inherits.keys()));
  const conflicts: ExtractionConflict[] = [];
  for (const leftovers of Array.from(unmatched.values())) {
    for (const old of leftovers) {
      const replacement = next.find((f) => !claimed.has(f.id) && factSubject(f) === factSubject(old));
      if (replacement) claimed.add(replacement.id);
      conflicts.push({
        previousFactId: old.id,
        key: old.key,
        scope: old.scope as FactScope,
        component: old.componentName ?? old.componentCas,
        previousValue: old.value,
        verifiedBy: old.verifiedById,
        reason: replacement ? "changed" : "missing",
        ...(replacement && { newFactId: replacement.id, newValue: replacement.value }),
      });
    }
  }
  return { inherits, conflicts };
};
