import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toCanonical } from "./units";
import { casCheckDigitOk, needsHumanCheckFor, prepareFact } from "./validate";
import { carryVerification, computeReviewState, missingRequiredKeys } from "./review";
import { nearDuplicates, valueSchemaProblems } from "./keys";
import { seedCatalog } from "./seedCatalog";
import type { FactDefinitionShape, FactInput } from "./types";

const definition = (overrides: Partial<FactDefinitionShape>): FactDefinitionShape => ({
  id: "def",
  key: "flashpoint",
  label: "Flash point",
  kind: "scalar",
  valueSchema: { type: "number" },
  unitFamily: "temperature",
  safetyRelevant: true,
  status: "approved",
  ...overrides,
});

const input = (overrides: Partial<FactInput>): FactInput => ({
  key: "flashpoint",
  value: 93,
  unit: "°C",
  quote: "Flash point: 93 °C (closed cup)",
  page: { index: 3, label: "4 of 9" },
  method: "text_layer",
  confidence: "high",
  ...overrides,
});

const prepared = (def: FactDefinitionShape, fact: FactInput) => {
  const check = prepareFact(def, fact);
  if ("errors" in check) throw new Error(check.errors.join("; "));
  return check;
};

describe("toCanonical", () => {
  it("converts temperatures to °C however the unit is written", () => {
    assert.equal(toCanonical("temperature", 93, "°C"), 93);
    assert.equal(toCanonical("temperature", 199.4, "° F"), 93);
    assert.equal(toCanonical("temperature", 366.15, "K"), 93);
    assert.equal(toCanonical("temperature", 93, "deg. C"), 93);
  });

  it("converts concentrations to %", () => {
    assert.equal(toCanonical("concentration", 5000, "ppm"), 0.5);
    assert.equal(toCanonical("concentration", 2, "% w/w"), 2);
  });

  it("returns null for units outside the family or no unit", () => {
    assert.equal(toCanonical("temperature", 93, "mg/kg"), null);
    assert.equal(toCanonical("temperature", 93, undefined), null);
  });
});

describe("casCheckDigitOk", () => {
  it("accepts real CAS numbers and catches typos", () => {
    assert.equal(casCheckDigitOk("56-81-5"), true); // glycerin
    assert.equal(casCheckDigitOk("7732-18-5"), true); // water
    assert.equal(casCheckDigitOk("56-81-6"), false);
  });
});

describe("prepareFact", () => {
  it("normalizes a number into the key's canonical unit and keeps the printed text", () => {
    const { fact } = prepared(definition({}), input({ value: 199.4, unit: "°F", printed: "199.4 °F (closed cup)" }));
    assert.equal(fact.normalizedValue, 93);
    assert.equal(fact.normalizedUnit, "°C");
    assert.equal(fact.printed, "199.4 °F (closed cup)");
    assert.equal(fact.pageIndex, 3);
    assert.equal(fact.pageLabel, "4 of 9");
  });

  it("keeps a range as a range with both bounds", () => {
    const { fact } = prepared(definition({}), input({ value: { min: 60, max: 65, qualifier: "open cup" } }));
    assert.deepEqual(fact.value, { min: 60, max: 65, qualifier: "open cup" });
    assert.equal(fact.normalizedValue, 60);
    assert.equal(fact.normalizedMax, 65);
  });

  it("warns, and leaves the number out of search, for an unknown unit", () => {
    const check = prepared(definition({}), input({ unit: "furlongs" }));
    assert.equal(check.fact.normalizedValue, null);
    assert.match(check.warnings[0], /isn't a known temperature unit/);
  });

  it("forces a human check for vision and OCR on safety-relevant keys only", () => {
    assert.equal(prepared(definition({}), input({ method: "vision" })).fact.needsHumanCheck, true);
    assert.equal(prepared(definition({}), input({ method: "ocr", needsHumanCheck: false })).fact.needsHumanCheck, true);
    assert.equal(prepared(definition({ safetyRelevant: false }), input({ method: "ocr" })).fact.needsHumanCheck, false);
    assert.equal(prepared(definition({}), input({})).fact.needsHumanCheck, false);
    assert.equal(needsHumanCheckFor({ safetyRelevant: false }, "text_layer", true), true);
  });

  it("refuses method human from an agent", () => {
    const check = prepareFact(definition({}), input({ method: "human" }));
    assert.ok("errors" in check && check.errors.some((e) => e.includes("only set by people")));
  });

  it("checks row columns and keeps each row's own values", () => {
    const exposure = definition({
      key: "exposure_limit",
      kind: "row",
      unitFamily: null,
      valueSchema: { columns: [{ name: "chemical", type: "text" }, { name: "cas", type: "cas" }, { name: "basis", type: "text", required: true }, { name: "limit", type: "text", required: true }] },
    });
    const rows = ["OSHA PEL", "ACGIH TLV", "Cal/OSHA", "Manufacturer AEL"].map((basis, i) =>
      prepared(exposure, input({ key: "exposure_limit", value: { chemical: "Glycerin", cas: "56-81-5", basis, limit: "10 mg/m3" }, rowIndex: i, unit: undefined })),
    );
    assert.deepEqual(rows.map((r) => r.fact.rowIndex), [0, 1, 2, 3]);
    assert.equal((rows[1].fact.value as { basis: string }).basis, "ACGIH TLV");

    const missing = prepareFact(exposure, input({ key: "exposure_limit", value: { chemical: "Glycerin" } }));
    assert.ok("errors" in missing && missing.errors.some((e) => e.includes("basis is required")));
    const extra = prepareFact(exposure, input({ key: "exposure_limit", value: { basis: "x", limit: "y", note: "z" } }));
    assert.ok("errors" in extra && extra.errors.some((e) => e.includes("unknown columns note")));
  });

  it("flags a CAS typo but stores it as printed", () => {
    const composition = definition({ key: "composition", kind: "row", unitFamily: "concentration", valueSchema: { columns: [{ name: "chemical", type: "text", required: true }, { name: "cas", type: "cas" }] } });
    const check = prepared(composition, input({ key: "composition", value: { chemical: "Glycerin", cas: "56-81-6" }, unit: undefined }));
    assert.equal((check.fact.value as { cas: string }).cas, "56-81-6");
    assert.match(check.warnings[0], /check digit/);
  });

  it("normalizes a row's bounds through its normalize columns and default unit", () => {
    const composition = seedCatalog.find((d) => d.key === "composition")!;
    const def = definition({ key: "composition", kind: "row", unitFamily: "concentration", valueSchema: composition.valueSchema! });
    const { fact } = prepared(def, input({ key: "composition", unit: undefined, value: { chemical: "Linalool", cas: "78-70-6", concentration: "1 - 5 %", concentration_min: 1, concentration_max: 5 } }));
    assert.equal(fact.normalizedValue, 1);
    assert.equal(fact.normalizedMax, 5);
    assert.equal(fact.unit, "%");
  });

  it("takes a claim status, and never treats not_stated as negated", () => {
    const vegan = definition({ key: "vegan", kind: "claim", valueSchema: {}, unitFamily: null, safetyRelevant: false });
    assert.deepEqual(prepared(vegan, input({ key: "vegan", value: "not_stated", unit: undefined })).fact.value, { status: "not_stated" });
    assert.ok("errors" in prepareFact(vegan, input({ key: "vegan", value: { status: "maybe" } })));
  });

  it("tells an empty section from one that isn't there", () => {
    const section = definition({ key: "section_transport", kind: "section", valueSchema: {}, unitFamily: null });
    assert.equal(prepared(section, input({ key: "section_transport", value: { present: true, empty: true }, unit: undefined })).fact.printed, "empty");
    assert.ok("errors" in prepareFact(section, input({ key: "section_transport", value: { present: false, empty: true } })));
  });

  it("requires a component to be named by chemical name or CAS", () => {
    const check = prepareFact(definition({}), input({ scope: "component" }));
    assert.ok("errors" in check);
    assert.equal(prepared(definition({}), input({ component: { cas: "56-81-5" } })).fact.scope, "component");
  });
});

describe("computeReviewState", () => {
  const fact = (safetyRelevant: boolean, verified: boolean, method = "text_layer") => ({ state: "active", method, verifiedAt: verified ? new Date() : null, safetyRelevant });

  it("is judged on safety-relevant facts when there are any", () => {
    assert.equal(computeReviewState([fact(true, true), fact(false, false)]), "verified");
    assert.equal(computeReviewState([fact(true, true), fact(true, false)]), "partially_verified");
    assert.equal(computeReviewState([fact(true, false), fact(false, true)]), "unreviewed");
  });

  it("counts people's own facts as verified and falls back to all facts", () => {
    assert.equal(computeReviewState([fact(true, false, "human")]), "verified");
    assert.equal(computeReviewState([fact(false, true), fact(false, false)]), "partially_verified");
    assert.equal(computeReviewState([]), "unreviewed");
  });
});

describe("missingRequiredKeys", () => {
  it("lists required keys without an active fact", () => {
    assert.deepEqual(missingRequiredKeys(["signal_word", "sheet_date", "signal_word"], [{ key: "signal_word", state: "active" }, { key: "sheet_date", state: "overridden" }]), ["sheet_date"]);
  });
});

describe("carryVerification", () => {
  const base = { key: "flashpoint", scope: "material", componentName: null, componentCas: null, value: 93, normalizedValue: 93, pageIndex: 3 };

  it("carries a check to an identical fact and reports changed or missing ones", () => {
    const old = [
      { ...base, id: "a", verifiedById: "u1", verifiedAt: new Date() },
      { ...base, id: "b", key: "signal_word", value: "warning", normalizedValue: null, verifiedById: "u1", verifiedAt: new Date() },
      { ...base, id: "c", key: "un_number", value: "UN1993", normalizedValue: null, verifiedById: "u2", verifiedAt: new Date() },
    ];
    const next = [
      { ...base, id: "n1" },
      { ...base, id: "n2", key: "signal_word", value: "danger", normalizedValue: null },
    ];
    const { inherits, conflicts } = carryVerification(old, next);
    assert.equal(inherits.get("n1")?.id, "a");
    assert.equal(inherits.has("n2"), false);
    assert.deepEqual(
      conflicts.map((c) => [c.previousFactId, c.reason, c.newFactId]),
      [["b", "changed", "n2"], ["c", "missing", undefined]],
    );
  });

  it("matches each verified fact once, so duplicate rows don't share one check", () => {
    const { inherits } = carryVerification([{ ...base, id: "a", verifiedById: "u", verifiedAt: new Date() }], [{ ...base, id: "n1" }, { ...base, id: "n2" }]);
    assert.equal(inherits.size, 1);
  });

  it("doesn't carry a check when the page moved", () => {
    const { inherits, conflicts } = carryVerification([{ ...base, id: "a", verifiedById: "u", verifiedAt: new Date() }], [{ ...base, id: "n", pageIndex: 4 }]);
    assert.equal(inherits.size, 0);
    assert.equal(conflicts[0].reason, "changed");
  });
});

describe("nearDuplicates", () => {
  const existing = [
    { key: "nanomaterial_free", label: "Nanomaterial-free", kind: "claim", status: "approved" },
    { key: "boiling_point", label: "Boiling point", kind: "scalar", status: "approved" },
    { key: "hazard_statement", label: "Hazard statement", kind: "row", status: "approved" },
  ];

  it("catches keys that are the same fact under another name", () => {
    assert.deepEqual(nearDuplicates({ key: "nano_free", label: "Nano-free" }, existing).map((d) => d.key), ["nanomaterial_free"]);
    assert.deepEqual(nearDuplicates({ key: "hazard_statements", label: "Hazard statements" }, existing).map((d) => d.key), ["hazard_statement"]);
  });

  it("lets different facts through", () => {
    assert.deepEqual(nearDuplicates({ key: "melting_point", label: "Melting point" }, existing), []);
    assert.deepEqual(nearDuplicates({ key: "paraben_free", label: "Paraben-free" }, existing), []);
  });
});

describe("valueSchemaProblems", () => {
  it("requires the shape each kind needs", () => {
    assert.deepEqual(valueSchemaProblems("scalar", { type: "number" }, "temperature"), []);
    assert.ok(valueSchemaProblems("scalar", {}).length);
    assert.ok(valueSchemaProblems("enum", { options: [] }).length);
    assert.ok(valueSchemaProblems("row", { columns: [{ name: "Chemical", type: "text" }] }).length);
    assert.ok(valueSchemaProblems("claim", {}, "temperature").length);
  });
});

describe("seedCatalog", () => {
  it("has unique keys whose value schemas fit their kinds", () => {
    const keys = seedCatalog.map((d) => d.key);
    assert.equal(new Set(keys).size, keys.length);
    for (const d of seedCatalog) assert.deepEqual(valueSchemaProblems(d.kind, d.valueSchema ?? {}, d.unitFamily), [], d.key);
  });
});
