import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { genericCutoff, impliedClassification, inciMismatches, regulatoryDisagreements, runCrossChecks, sameCasDifferentNames, type CheckFact, type ItemRef } from "./crossChecks";

let seq = 0;
const fact = (extractionId: string, key: string, value: unknown, extra: Partial<CheckFact> = {}): CheckFact => ({
  id: `f${++seq}`,
  extractionId,
  sha256: `sha-${extractionId}`,
  key,
  componentName: null,
  componentCas: null,
  value,
  printed: typeof value === "string" ? value : null,
  pageIndex: 2,
  pageLabel: null,
  quote: "quoted",
  ...extra,
});

const glycerin: ItemRef = { id: "i1", name: "Glycerin USP", referenceCode: "ING-1" };
const lavender: ItemRef = { id: "i2", name: "Lavender Oil", referenceCode: "ING-2" };
const items = new Map<string, ItemRef[]>([
  ["sha-a", [glycerin]],
  ["sha-b", [lavender]],
]);

describe("sameCasDifferentNames", () => {
  it("flags a CAS written with different chemical names, ignoring case and punctuation", () => {
    const facts = [
      fact("a", "composition", { chemical: "Glycerin", cas: "56-81-5" }),
      fact("b", "prop65", { chemical: "Glycerol", cas: "56-81-5", exposure: "carcinogen" }),
      fact("b", "composition", { chemical: "GLYCERIN", cas: "56-81-5" }),
      fact("a", "composition", { chemical: "Water", cas: "7732-18-5" }),
    ];
    const findings = sameCasDifferentNames(facts, items);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].cas, "56-81-5");
    assert.match(findings[0].summary, /Glycerin.*Glycerol/);
    assert.deepEqual(findings[0].items.map((i) => i.id).sort(), ["i1", "i2"]);
  });

  it("reads component scope facts too", () => {
    const facts = [
      fact("a", "exposure_limit", { basis: "OSHA PEL", limit: "5" }, { componentName: "Linalool", componentCas: "78-70-6" }),
      fact("b", "allergen", { chemical: "Linalol", cas: "78-70-6" }),
    ];
    assert.equal(sameCasDifferentNames(facts, items).length, 1);
  });
});

describe("regulatoryDisagreements", () => {
  it("flags sheets that list the same CAS differently", () => {
    const facts = [
      fact("a", "prop65", { chemical: "Benzene", cas: "71-43-2", exposure: "carcinogen" }),
      fact("b", "prop65", { chemical: "Benzene", cas: "71-43-2", exposure: "both" }),
      fact("a", "state_right_to_know", { chemical: "Benzene", cas: "71-43-2", states: ["NJ", "PA"] }),
      fact("b", "state_right_to_know", { chemical: "Benzene", cas: "71-43-2", states: ["PA", "NJ"] }),
    ];
    const findings = regulatoryDisagreements(facts, items);
    assert.equal(findings.length, 1, "same states in another order agree");
    assert.match(findings[0].summary, /Prop 65: carcinogen vs both/);
    assert.equal(findings[0].severity, "warning");
  });

  it("flags a sheet that contains a listed chemical but doesn't list it, only when it captured its regulatory section", () => {
    const listed = fact("a", "tsca_basis", { chemical: "Limonene", cas: "5989-27-5", basis: "active" });
    const composition = fact("b", "composition", { chemical: "Limonene", cas: "5989-27-5" });
    assert.equal(regulatoryDisagreements([listed, composition], items).length, 0);
    const captured = fact("b", "section_regulatory", { present: true, empty: false });
    const findings = regulatoryDisagreements([listed, composition, captured], items);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].severity, "info");
    assert.match(findings[0].summary, /TSCA basis in 1 sheet, but 1 other sheet that contains it doesn't list it/);
  });
});

describe("impliedClassification", () => {
  it("flags a component hazard above its cut-off that the material doesn't state", () => {
    const facts = [
      fact("a", "ghs_classification", { hazard_class: "Skin Irrit.", category: "2", h_code: "H315" }),
      fact("a", "composition", { chemical: "Linalool", cas: "78-70-6", concentration_max: 0.5, classifications: ["Skin Sens. 1B H317", "Skin Irrit. 2 H315"] }),
      fact("a", "composition", { chemical: "Ethanol", cas: "64-17-5", concentration_max: 0.5, classifications: ["H225"] }),
    ];
    const findings = impliedClassification(facts, items);
    assert.equal(findings.length, 1, "H225 at 0.5% is below the generic 1% limit");
    assert.match(findings[0].summary, /Linalool at up to 0.5% carries H317/);
  });

  it("treats H350i as H350 and checks stated hazard statements too", () => {
    const facts = [
      fact("a", "hazard_statement", { code: "H350", text: "May cause cancer" }),
      fact("a", "composition", { chemical: "X", concentration_min: 2, classifications: ["Carc. 1B H350i"] }),
    ];
    assert.equal(impliedClassification(facts, items).length, 0);
    assert.equal(genericCutoff("H350"), 0.1);
    assert.equal(genericCutoff("H315"), 1);
  });

  it("doesn't guess without a stated classification or signal word", () => {
    const facts = [fact("a", "composition", { chemical: "X", concentration_max: 50, classifications: ["H302"] })];
    assert.equal(impliedClassification(facts, items).length, 0);
    const withSignal = [...facts, fact("a", "signal_word", "none"), fact("a", "acute_toxicity_status", "none")];
    const findings = impliedClassification(withSignal, items);
    assert.equal(findings.length, 1);
    assert.match(findings[0].summary, /also says no acute toxicity/);
  });
});

describe("inciMismatches", () => {
  it("compares stated INCI names and composition with the item's INCI aliases", () => {
    const facts = [
      fact("a", "inci_name", "Glycerine"),
      fact("a", "composition", { chemical: "Glycerin" }),
      fact("a", "composition", { chemical: "Water" }),
    ];
    const findings = inciMismatches(facts, items, new Map([["i1", ["Glycerin", "Aqua"]]]));
    const summaries = findings.map((f) => f.summary);
    assert.ok(summaries.some((s) => /documents state INCI “Glycerine”, not among its INCI aliases/.test(s)));
    assert.ok(summaries.some((s) => /INCI alias “Glycerin”, “Aqua” isn't stated/.test(s)));
    assert.ok(summaries.some((s) => /composition lists “Water”/.test(s)));
    assert.ok(!summaries.some((s) => /composition lists “Glycerin”/.test(s)));
  });

  it("says nothing about composition when the item has no INCI aliases", () => {
    const facts = [fact("b", "composition", { chemical: "Linalool" })];
    assert.deepEqual(inciMismatches(facts, items, new Map()), []);
  });
});

describe("runCrossChecks", () => {
  it("runs the chosen checks, warnings first", () => {
    const facts = [
      fact("a", "composition", { chemical: "Glycerin", cas: "56-81-5" }),
      fact("b", "composition", { chemical: "Glycerol", cas: "56-81-5" }),
      fact("a", "prop65", { chemical: "Benzene", cas: "71-43-2", exposure: "carcinogen" }),
      fact("b", "prop65", { chemical: "Benzene", cas: "71-43-2", exposure: "both" }),
    ];
    const all = runCrossChecks(facts, items, new Map());
    assert.deepEqual(all.map((f) => f.check), ["regulatory_disagreement", "same_cas_different_names"]);
    assert.deepEqual(runCrossChecks(facts, items, new Map(), ["same_cas_different_names"]).map((f) => f.check), ["same_cas_different_names"]);
  });
});
