import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nextSku, normalizeSkuPrefix, skuPrefixError } from "./sku";

describe("nextSku", () => {
  it("starts at 0001 when nothing uses the prefix", () => {
    assert.equal(nextSku("RAW", []), "RAW0001");
    assert.equal(nextSku("FO", ["RAW0005", "FOAM12"]), "FO0001");
  });

  it("fills the lowest unused number, case-insensitively", () => {
    assert.equal(nextSku("FO", ["fo0001", "FO0002", "FO0004", "FO7789"]), "FO0003");
    assert.equal(nextSku("RAW", ["RAW9985", "RAW0080"]), "RAW0001");
  });

  it("treats differently padded codes as the same number", () => {
    assert.equal(nextSku("RAW", ["RAW0001", "RAW00002", "RAW3"]), "RAW0004");
  });

  it("grows a digit only once every 4-digit number is taken", () => {
    const all = Array.from({ length: 9999 }, (_, i) => `RAW${String(i + 1).padStart(4, "0")}`);
    assert.equal(nextSku("RAW", all), "RAW10000");
  });

  it("ignores codes that only start with the prefix", () => {
    assert.equal(nextSku("FO", ["FO12A", "FOX0009", "XFO0009", "FO-0003"]), "FO0001");
  });

  it("treats regex characters in the prefix literally", () => {
    assert.equal(nextSku("A.B-", ["AXB-0001", "A.B-0001"]), "A.B-0002");
  });
});

describe("SKU prefixes", () => {
  it("normalizes and validates", () => {
    assert.equal(normalizeSkuPrefix("  fo "), "FO");
    assert.equal(normalizeSkuPrefix(null), "");
    assert.equal(skuPrefixError(""), null);
    assert.equal(skuPrefixError("RAW-"), null);
    assert.ok(skuPrefixError("RAW1"));
    assert.ok(skuPrefixError("RA W"));
  });
});
