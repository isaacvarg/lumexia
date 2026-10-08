import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanSupplierLot, normalizeSupplierLot, sameSupplierLot } from "./supplierLots";

describe("supplier lots", () => {
  it("ignores case, spaces, hyphens, underscores and slashes", () => {
    assert.equal(normalizeSupplierLot(" ab-12_3/4 "), "AB1234");
    assert.ok(sameSupplierLot("ab-1234", "AB 1234"));
  });

  it("keeps other characters significant", () => {
    assert.ok(!sameSupplierLot("AB1.234", "AB1234"));
    assert.ok(!sameSupplierLot("AB1234", "AB12345"));
  });

  it("never matches blanks", () => {
    assert.ok(!sameSupplierLot(" ", " - "));
    assert.equal(cleanSupplierLot("  "), null);
    assert.equal(cleanSupplierLot(" AB1 "), "AB1");
  });
});
