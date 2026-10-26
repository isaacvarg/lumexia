// Checks across extractions that every agent would otherwise reimplement: the same CAS under different
// names, regulatory listings that disagree between suppliers, hazards a component carries that the
// material's own classification leaves out, and composition or INCI names that don't match the item's INCI
// aliases. They point people at things to look at; they never decide which sheet is right (an SDS's own
// section 2 classification stands). Pure, so it's tested without a database.

export const crossCheckKinds = ["same_cas_different_names", "regulatory_disagreement", "implied_classification", "inci_mismatch"] as const;
export type CrossCheckKind = (typeof crossCheckKinds)[number];

export type CheckFact = {
  id: string;
  extractionId: string;
  sha256: string;
  key: string;
  componentName: string | null;
  componentCas: string | null;
  value: unknown;
  printed: string | null;
  pageIndex: number | null;
  pageLabel: string | null;
  quote: string;
};

export type ItemRef = { id: string; name: string; referenceCode: string };

export type FindingFact = { factId: string; extractionId: string; key: string; printed: string | null; page: string | null; quote: string; items: ItemRef[] };

export type Finding = {
  check: CrossCheckKind;
  severity: "warning" | "info";
  summary: string;
  cas?: string;
  items: ItemRef[];
  facts: FindingFact[];
};

const row = (f: CheckFact) => (f.value && typeof f.value === "object" && !Array.isArray(f.value) ? (f.value as Record<string, unknown>) : {});
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
export const casOf = (f: CheckFact) => f.componentCas?.trim() || str(row(f).cas);
export const chemicalOf = (f: CheckFact) => f.componentName?.trim() || str(row(f).chemical);
export const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

const pageText = (f: CheckFact) => (f.pageLabel ? `p. ${f.pageLabel}` : f.pageIndex !== null ? `p. ${f.pageIndex + 1}` : null);

const uniqueItems = (lists: ItemRef[][]) => Array.from(new Map(lists.flat().map((i) => [i.id, i])).values());

const makeFact = (f: CheckFact, itemsBySha: Map<string, ItemRef[]>): FindingFact => ({
  factId: f.id,
  extractionId: f.extractionId,
  key: f.key,
  printed: f.printed,
  page: pageText(f),
  quote: f.quote,
  items: itemsBySha.get(f.sha256) ?? [],
});

const finding = (check: CrossCheckKind, severity: Finding["severity"], summary: string, facts: CheckFact[], itemsBySha: Map<string, ItemRef[]>, cas?: string): Finding => {
  const described = facts.map((f) => makeFact(f, itemsBySha));
  return { check, severity, summary, ...(cas && { cas }), items: uniqueItems(described.map((f) => f.items)), facts: described };
};

const NAMED_KEYS = new Set(["composition", "allergen", "prop65", "state_right_to_know", "sara_311_312", "tsca_basis", "exposure_limit", "acute_toxicity"]);

// A CAS number written with different chemical names, across sheets or within one.
export const sameCasDifferentNames = (facts: CheckFact[], itemsBySha: Map<string, ItemRef[]>): Finding[] => {
  const byCas = new Map<string, CheckFact[]>();
  for (const f of facts) {
    if (!NAMED_KEYS.has(f.key)) continue;
    const cas = casOf(f);
    const name = chemicalOf(f);
    if (!cas || !name) continue;
    byCas.set(cas, [...(byCas.get(cas) ?? []), f]);
  }
  const findings: Finding[] = [];
  for (const [cas, list] of Array.from(byCas.entries())) {
    const names = new Map<string, string>();
    for (const f of list) {
      const key = normalizeName(chemicalOf(f)!);
      if (!names.has(key)) names.set(key, chemicalOf(f)!);
    }
    if (names.size < 2) continue;
    // one fact per name is enough evidence
    const examples = Array.from(names.keys()).map((n) => list.find((f) => normalizeName(chemicalOf(f)!) === n)!);
    findings.push(finding("same_cas_different_names", "info", `CAS ${cas} is named ${Array.from(names.values()).map((n) => `“${n}”`).join(", ")}`, examples, itemsBySha, cas));
  }
  return findings;
};

const listingValue: Record<string, (f: CheckFact) => string | null> = {
  prop65: (f) => str(row(f).exposure),
  tsca_basis: (f) => str(row(f).basis),
  state_right_to_know: (f) => {
    const states = row(f).states;
    return Array.isArray(states) ? states.map((s) => String(s).trim().toUpperCase()).sort().join(", ") : null;
  },
};
const listingLabel: Record<string, string> = { prop65: "Prop 65", tsca_basis: "TSCA basis", state_right_to_know: "state right-to-know" };

// The same CAS listed differently by different sheets (Prop 65 exposure, TSCA basis, RTK states), or listed on
// one sheet while another sheet that captured its regulatory section has the chemical but doesn't list it.
export const regulatoryDisagreements = (facts: CheckFact[], itemsBySha: Map<string, ItemRef[]>): Finding[] => {
  const findings: Finding[] = [];
  const regulatoryCaptured = new Set(
    facts.filter((f) => f.key === "section_regulatory" && (f.value as { present?: boolean })?.present).map((f) => f.extractionId),
  );
  const compositionByCas = new Map<string, CheckFact[]>();
  for (const f of facts.filter((f) => f.key === "composition")) {
    const cas = casOf(f);
    if (cas) compositionByCas.set(cas, [...(compositionByCas.get(cas) ?? []), f]);
  }

  for (const key of Object.keys(listingValue)) {
    const byCas = new Map<string, CheckFact[]>();
    for (const f of facts.filter((f) => f.key === key)) {
      const cas = casOf(f);
      if (cas) byCas.set(cas, [...(byCas.get(cas) ?? []), f]);
    }
    for (const [cas, list] of Array.from(byCas.entries())) {
      const name = chemicalOf(list[0]) ?? cas;
      // one listing per extraction; different values across extractions disagree
      const perExtraction = new Map<string, CheckFact>();
      for (const f of list) if (!perExtraction.has(f.extractionId)) perExtraction.set(f.extractionId, f);
      const values = new Map<string, CheckFact[]>();
      for (const f of Array.from(perExtraction.values())) {
        const v = listingValue[key](f) ?? "";
        values.set(v, [...(values.get(v) ?? []), f]);
      }
      if (values.size > 1) {
        findings.push(
          finding(
            "regulatory_disagreement",
            "warning",
            `${name} (${cas}): sheets disagree on ${listingLabel[key]}: ${Array.from(values.keys()).map((v) => v || "unspecified").join(" vs ")}`,
            Array.from(values.values()).map((fs) => fs[0]),
            itemsBySha,
            cas,
          ),
        );
      }
      // sheets that contain the chemical and captured their regulatory section, but don't list it
      const silent = (compositionByCas.get(cas) ?? []).filter((c) => !perExtraction.has(c.extractionId) && regulatoryCaptured.has(c.extractionId));
      const silentByExtraction = Array.from(new Map(silent.map((c) => [c.extractionId, c])).values());
      if (silentByExtraction.length) {
        findings.push(
          finding(
            "regulatory_disagreement",
            "info",
            `${name} (${cas}) is on ${listingLabel[key]} in ${perExtraction.size} sheet${perExtraction.size === 1 ? "" : "s"}, but ${silentByExtraction.length} other sheet${silentByExtraction.length === 1 ? " that contains it doesn't" : "s that contain it don't"} list it`,
            [list[0], ...silentByExtraction],
            itemsBySha,
            cas,
          ),
        );
      }
    }
  }
  return findings;
};

const H_CODE = /\b(?:EU)?H\d{3}[A-Za-z]*/gi;
// H350i and H360FD are the same hazards as H350 and H360 for comparing against a stated classification
const hCodes = (text: string) => Array.from(new Set((text.match(H_CODE) ?? []).map((c) => c.toUpperCase().match(/^(EU)?H\d{3}/)![0])));

// GHS generic concentration limits: most hazards count from 1%; category 1 carcinogens, mutagens and
// reproductive toxicants and respiratory/skin sensitisers from 0.1%. Specific limits, M factors and the
// additivity formulas for acute toxicity and aquatic hazards aren't applied, so these are prompts to look.
const STRICT_CUTOFF = new Set(["H340", "H350", "H360", "H334", "H317"]);
export const genericCutoff = (code: string) => (STRICT_CUTOFF.has(code) ? 0.1 : 1);

// Hazards a component carries above its generic cut-off that the material's stated classification omits.
export const impliedClassification = (facts: CheckFact[], itemsBySha: Map<string, ItemRef[]>): Finding[] => {
  const byExtraction = new Map<string, CheckFact[]>();
  for (const f of facts) byExtraction.set(f.extractionId, [...(byExtraction.get(f.extractionId) ?? []), f]);
  const findings: Finding[] = [];

  for (const [, list] of Array.from(byExtraction.entries())) {
    const statedFacts = list.filter((f) => f.key === "ghs_classification" || f.key === "hazard_statement");
    const statusFact = list.find((f) => f.key === "acute_toxicity_status");
    // nothing stated and no statement that the material is unclassified: no basis to compare
    if (!statedFacts.length && !list.some((f) => f.key === "signal_word")) continue;
    const stated = new Set(
      statedFacts.flatMap((f) => hCodes([str(row(f).h_code), str(row(f).code), f.printed].filter(Boolean).join(" "))),
    );

    for (const c of list.filter((f) => f.key === "composition")) {
      const r = row(c);
      const classifications = Array.isArray(r.classifications) ? r.classifications.map(String).join(" ") : "";
      const share = typeof r.concentration_max === "number" ? r.concentration_max : typeof r.concentration_min === "number" ? r.concentration_min : null;
      if (!classifications || share === null) continue;
      const missing = hCodes(classifications).filter((code) => share >= genericCutoff(code) && !stated.has(code));
      if (!missing.length) continue;
      const acute = missing.some((m) => /^H3(00|01|02|10|11|12|30|31|32)$/.test(m));
      findings.push(
        finding(
          "implied_classification",
          "warning",
          `${chemicalOf(c) ?? "A component"} at up to ${share}% carries ${missing.join(", ")}, which the material's classification doesn't state` +
            (acute && (statusFact?.value === "none") ? "; the sheet also says no acute toxicity" : ""),
          [c, ...statedFacts.slice(0, 3)],
          itemsBySha,
          casOf(c) ?? undefined,
        ),
      );
    }
  }
  return findings;
};

// For one item: INCI names its documents state that aren't among its INCI aliases, aliases no document
// states, and composition chemicals with no matching INCI alias.
export const inciMismatches = (
  facts: CheckFact[],
  itemsBySha: Map<string, ItemRef[]>,
  aliasesByItem: Map<string, string[]>,
): Finding[] => {
  const findings: Finding[] = [];
  const itemIds = Array.from(new Set(Array.from(itemsBySha.values()).flat().map((i) => i.id)));
  for (const itemId of itemIds) {
    const shas = new Set(Array.from(itemsBySha.entries()).filter(([, items]) => items.some((i) => i.id === itemId)).map(([sha]) => sha));
    const itemFacts = facts.filter((f) => shas.has(f.sha256));
    const item = itemsBySha.get(Array.from(shas)[0])!.find((i) => i.id === itemId)!;
    const aliases = aliasesByItem.get(itemId) ?? [];
    const aliasNames = new Set(aliases.map(normalizeName));

    const inciFacts = itemFacts.filter((f) => f.key === "inci_name" && typeof f.value === "string");
    const stated = new Set(inciFacts.map((f) => normalizeName(f.value as string)));
    const unknown = inciFacts.filter((f) => !aliasNames.has(normalizeName(f.value as string)));
    if (unknown.length) {
      findings.push({
        ...finding("inci_mismatch", "warning", `${item.name}: documents state INCI ${unknown.map((f) => `“${f.value}”`).join(", ")}, not among its INCI aliases`, unknown, itemsBySha),
        items: [item],
      });
    }
    if (inciFacts.length && aliases.some((a) => !stated.has(normalizeName(a)))) {
      const unstated = aliases.filter((a) => !stated.has(normalizeName(a)));
      findings.push({
        ...finding("inci_mismatch", "info", `${item.name}: INCI alias ${unstated.map((a) => `“${a}”`).join(", ")} isn't stated by its documents`, inciFacts.slice(0, 1), itemsBySha),
        items: [item],
      });
    }
    if (aliases.length) {
      const unmatched = itemFacts.filter((f) => f.key === "composition" && chemicalOf(f) && !aliasNames.has(normalizeName(chemicalOf(f)!)));
      const distinct = Array.from(new Map(unmatched.map((f) => [normalizeName(chemicalOf(f)!), f])).values());
      if (distinct.length) {
        findings.push({
          ...finding(
            "inci_mismatch",
            "info",
            `${item.name}: composition lists ${distinct.map((f) => `“${chemicalOf(f)}”`).join(", ")}, none of which is an INCI alias (${aliases.join(", ")})`,
            distinct,
            itemsBySha,
          ),
          items: [item],
        });
      }
    }
  }
  return findings;
};

export const runCrossChecks = (
  facts: CheckFact[],
  itemsBySha: Map<string, ItemRef[]>,
  aliasesByItem: Map<string, string[]>,
  checks: readonly CrossCheckKind[] = crossCheckKinds,
): Finding[] => {
  const runners: Record<CrossCheckKind, () => Finding[]> = {
    same_cas_different_names: () => sameCasDifferentNames(facts, itemsBySha),
    regulatory_disagreement: () => regulatoryDisagreements(facts, itemsBySha),
    implied_classification: () => impliedClassification(facts, itemsBySha),
    inci_mismatch: () => inciMismatches(facts, itemsBySha, aliasesByItem),
  };
  return checks.flatMap((c) => runners[c]()).sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "warning" ? -1 : 1));
};
