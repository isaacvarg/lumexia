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
  it("leaves text specs without a limit", () => {
    for (const text of ["Conforms", "White powder", "Report", "", null]) assert.equal(parseSpecification(text), null);
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
