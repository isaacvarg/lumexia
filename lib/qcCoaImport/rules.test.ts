import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeOutcome, decideReview, normalizeTestName, parseResultNumber, parseSpecification, recordVerdict, unitsComparable } from "./rules";

describe("normalizeTestName", () => {
  it("ignores case, spacing and punctuation", () => {
    assert.equal(normalizeTestName("Acid Value."), normalizeTestName("acid-value"));
    assert.notEqual(normalizeTestName("Acid Value"), normalizeTestName("Acid No."));
  });
});

describe("parseSpecification", () => {
  it("reads ranges, maximums and minimums", () => {
    assert.deepEqual(parseSpecification("5.0 - 7.0"), { type: "range", valueA: "5", valueB: "7" });
    assert.deepEqual(parseSpecification("98,0–102.0 %"), { type: "range", valueA: "98", valueB: "102" });
    assert.deepEqual(parseSpecification("≤ 0.5"), { type: "max", valueA: "0.5", valueB: null });
    assert.deepEqual(parseSpecification("NMT 10 ppm"), { type: "max", valueA: "10", valueB: null });
    assert.deepEqual(parseSpecification("min 98"), { type: "min", valueA: "98", valueB: null });
    assert.deepEqual(parseSpecification("> 98"), { type: "min", valueA: "98", valueB: null });
  });
  it("reads every printed form of a one-sided limit, keeping the printed precision", () => {
    const max = (valueA: string) => ({ type: "max", valueA, valueB: null });
    const min = (valueA: string) => ({ type: "min", valueA, valueB: null });
    const cases: [string, unknown][] = [
      ["0.8 max", max("0.8")], ["2 max", max("2")], ["10.0 max", max("10.0")], ["  10.0   MAX ", max("10.0")], ["0.8 max %", max("0.8")], ["0.8 % max", max("0.8")], ["0.3 Maximum", max("0.3")],
      ["max 10.0", max("10.0")], ["≤ 2", max("2")], ["<= 2.0", max("2.0")], ["< 2", max("2")], ["not more than 2.0", max("2.0")], ["NMT 2.0", max("2.0")], ["nmt 0,50", max("0.50")],
      ["90.0 min", min("90.0")], ["90.0 MIN.", min("90.0")], ["min 90.0", min("90.0")], ["≥ 90", min("90")], [">= 90.0", min("90.0")], ["> 90", min("90")], ["not less than 90.0", min("90.0")], ["NLT 90.0", min("90.0")],
    ];
    for (const [text, expected] of cases) assert.deepEqual(parseSpecification(text), expected, text);
  });
  it("leaves text specs without a limit", () => {
    for (const text of ["Conforms", "White powder", "Report", "", "   ", "Clear oily liquid", "Conforms to Limits", "Very slight, Characteristic", null]) assert.equal(parseSpecification(text), null);
  });
});

describe("parseSpecification on the castor oil COA", () => {
  const ranges = ["0.957-0.961", "160 - 168", "0.7 – 1.5", "2.5 – 6.0", "2.5 – 7.0", "85.0 – 92.0", "2.0 – 4.0", "2.5 – 5.0", "0.2 – 0.8"];
  const maxes = ["0.8 max", "0.3 max", "2 max", "10.0 max", "2.0 max", "2.5 max", "1.0 max", "1.0 max", "1.0 max"];
  const mins = ["90.0 min"];
  const qualitative = ["Clear oily liquid", "Very slight, Characteristic", "Conforms", "Conforms to Limits", "Conforms"];
  it("seeds 19 of the 24 rows: 9 range, 9 max, 1 min", () => {
    const types = [...ranges, ...maxes, ...mins, ...qualitative].map((text) => parseSpecification(text)?.type ?? null);
    const count = (t: string | null) => types.filter((x) => x === t).length;
    assert.equal(types.length, 24);
    assert.deepEqual([count("range"), count("max"), count("min"), count(null)], [9, 9, 1, 5]);
  });
});

describe("computeOutcome", () => {
  const range = { specificationType: "range", valueA: "5", valueB: "7" };
  it("passes and fails numbers against the limits", () => {
    assert.equal(computeOutcome(range, "6.2"), "pass");
    assert.equal(computeOutcome(range, "7.1"), "fail");
    assert.equal(computeOutcome({ specificationType: "max", valueA: "0.5", valueB: null }, "0.5"), "pass");
    assert.equal(computeOutcome({ specificationType: "min", valueA: "98", valueB: null }, "97.9"), "fail");
  });
  it("cannot tell without a spec or for a result that isn't a plain number", () => {
    assert.equal(computeOutcome(null, "6"), null);
    assert.equal(computeOutcome(range, "<0.1"), null);
    assert.equal(computeOutcome(range, "Conforms"), null);
  });
});

describe("parseResultNumber", () => {
  it("accepts a number with a trailing unit only", () => {
    assert.equal(parseResultNumber("6,5"), 6.5);
    assert.equal(parseResultNumber("0.4 %"), 0.4);
    assert.equal(parseResultNumber("ND"), null);
  });
});

describe("unitsComparable", () => {
  it("compares only the same unit, or when one side printed none", () => {
    assert.equal(unitsComparable("mg KOH/g", "mg koh/g"), true);
    assert.equal(unitsComparable("", "%"), true);
    assert.equal(unitsComparable("ppm", "%"), false);
  });
});

describe("decideReview", () => {
  const clean = { confidence: "high", needsHumanCheck: false, newParameter: false, outcomes: { computed: "pass" as const, suggested: "pass" as const, supplier: "pass" as const }, unitMismatch: false, extraTest: false };
  it("accepts a clean high-confidence row", () => assert.equal(decideReview(clean).reviewState, "accepted"));
  it("flags each trigger", () => {
    assert.deepEqual(decideReview({ ...clean, confidence: "medium" }).reasons, ["lowConfidence"]);
    assert.deepEqual(decideReview({ ...clean, needsHumanCheck: true }).reasons, ["needsHumanCheck"]);
    assert.deepEqual(decideReview({ ...clean, newParameter: true }).reasons, ["newParameter"]);
    assert.deepEqual(decideReview({ ...clean, outcomes: { ...clean.outcomes, supplier: "fail" } }).reasons, ["outcomeDisagreement"]);
  });
});

describe("recordVerdict", () => {
  it("stays open until the baseline is approved and every test has a verdict", () => {
    assert.equal(recordVerdict({ baselineApproved: false, outcomes: ["pass"], missingTests: 0 }), null);
    assert.equal(recordVerdict({ baselineApproved: true, outcomes: ["pass", null], missingTests: 0 }), null);
    assert.equal(recordVerdict({ baselineApproved: true, outcomes: ["pass"], missingTests: 1 }), null);
  });
  it("fails on any failing test and passes when all pass", () => {
    assert.equal(recordVerdict({ baselineApproved: true, outcomes: ["pass", "fail"], missingTests: 1 }), "outOfSpecification");
    assert.equal(recordVerdict({ baselineApproved: true, outcomes: ["pass", "pass"], missingTests: 0 }), "pass");
  });
});
