import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { suggestSupplierId } from "./suppliers";

const now = new Date("2026-10-06T00:00:00Z");

describe("suggestSupplierId", () => {
  it("suggests nothing without purchase history", () => {
    assert.equal(suggestSupplierId([], now), "");
  });

  it("suggests the only supplier ever used, however long ago", () => {
    assert.equal(suggestSupplierId([{ id: "a", lastOrderedAt: new Date("2019-01-01") }], now), "a");
  });

  it("suggests the only supplier used in the last 12 months", () => {
    const history = [
      { id: "a", lastOrderedAt: new Date("2026-08-01") },
      { id: "b", lastOrderedAt: new Date("2025-01-01") },
    ];
    assert.equal(suggestSupplierId(history, now), "a");
  });

  it("suggests nothing when several suppliers were used recently, or none were", () => {
    assert.equal(suggestSupplierId([{ id: "a", lastOrderedAt: "2026-08-01" }, { id: "b", lastOrderedAt: "2026-02-01" }], now), "");
    assert.equal(suggestSupplierId([{ id: "a", lastOrderedAt: "2024-08-01" }, { id: "b", lastOrderedAt: "2024-02-01" }], now), "");
  });
});
