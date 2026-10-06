import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RequirementInput, validateRequirement } from "./rules";

const input = (overrides: Partial<RequirementInput> = {}): RequirementInput => ({
  itemTypeId: "raw",
  procurementTypeId: null,
  fileTypeId: "sds",
  level: "required",
  scope: "item",
  issuer: "supplier",
  validForMonths: 36,
  minIssuedAt: null,
  warnDays: 60,
  notes: null,
  ...overrides,
});

describe("validateRequirement", () => {
  it("accepts a complete rule", () => {
    assert.equal(validateRequirement(input(), []), null);
  });

  it("needs something to match on", () => {
    assert.match(validateRequirement(input({ itemTypeId: null }), [])!, /item type/);
    assert.equal(validateRequirement(input({ itemTypeId: null, procurementTypeId: "purchased" }), []), null);
  });

  it("rejects unknown options and bad numbers", () => {
    assert.ok(validateRequirement(input({ level: "sometimes" }), []));
    assert.ok(validateRequirement(input({ scope: "batch" }), []));
    assert.ok(validateRequirement(input({ issuer: "customer" }), []));
    assert.ok(validateRequirement(input({ validForMonths: 0 }), []));
    assert.ok(validateRequirement(input({ validForMonths: 1.5 }), []));
    assert.ok(validateRequirement(input({ warnDays: -1 }), []));
    assert.equal(validateRequirement(input({ validForMonths: null, warnDays: 0 }), []), null);
  });

  it("rejects a second rule for the same match, document and issuer", () => {
    const existing = [{ id: "r1", itemTypeId: "raw", procurementTypeId: null, fileTypeId: "sds", issuer: "supplier" }];
    assert.ok(validateRequirement(input(), existing));
    assert.equal(validateRequirement(input(), existing, "r1"), null);
    assert.equal(validateRequirement(input({ issuer: "internal" }), existing), null);
    assert.equal(validateRequirement(input({ procurementTypeId: "purchased" }), existing), null);
  });
});
