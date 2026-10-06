import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateDocument, evaluateItemDocuments, evaluateRequirement, resolveRequirements } from "./evaluate";
import { DocumentRecord, LotRecord, Requirement } from "./types";

const now = new Date("2026-06-01T00:00:00Z");
const RAW = "raw-material";
const BASE = "base";
const PURCHASED = "purchased";
const PRODUCED = "produced";
const SDS = "sds";
const COA = "coa";

let seq = 0;
const rule = (overrides: Partial<Requirement>): Requirement => ({
  id: `rule-${++seq}`,
  itemTypeId: null,
  procurementTypeId: null,
  fileTypeId: SDS,
  level: "required",
  scope: "item",
  issuer: "supplier",
  validForMonths: null,
  minIssuedAt: null,
  warnDays: 60,
  notes: null,
  createdAt: new Date(2026, 0, seq),
  ...overrides,
});

const doc = (overrides: Partial<DocumentRecord>): DocumentRecord => ({
  id: `doc-${++seq}`,
  fileTypeId: SDS,
  issuer: "supplier",
  lotId: null,
  supplierId: null,
  issuedAt: null,
  expiresAt: null,
  supersededAt: null,
  derivedFrom: null,
  ...overrides,
});

describe("resolveRequirements", () => {
  const rawPurchased = { itemTypeId: RAW, procurementTypeId: PURCHASED };

  it("matches on item type, procurement type, or both", () => {
    const rules = [
      rule({ itemTypeId: RAW }),
      rule({ procurementTypeId: PURCHASED, fileTypeId: COA }),
      rule({ itemTypeId: BASE, fileTypeId: "tds" }),
      rule({ procurementTypeId: PRODUCED, fileTypeId: "ifra" }),
    ];
    const resolved = resolveRequirements(rules, rawPurchased);
    assert.deepEqual(resolved.map((r) => r.fileTypeId).sort(), [COA, SDS]);
  });

  it("lets the most specific rule win per file type + issuer", () => {
    const broad = rule({ procurementTypeId: PURCHASED, level: "required" });
    const middle = rule({ itemTypeId: RAW, level: "optional" });
    const narrow = rule({ itemTypeId: RAW, procurementTypeId: PURCHASED, validForMonths: 36 });
    assert.deepEqual(resolveRequirements([broad, narrow, middle], rawPurchased), [narrow]);
    assert.deepEqual(resolveRequirements([broad, middle], rawPurchased), [middle]);
  });

  it("drops a requirement when the winning rule excludes it", () => {
    const rules = [rule({ procurementTypeId: PURCHASED }), rule({ itemTypeId: RAW, level: "excluded" })];
    assert.deepEqual(resolveRequirements(rules, rawPurchased), []);
  });

  it("keeps supplier and internal requirements for the same file type apart", () => {
    const supplier = rule({ itemTypeId: RAW, issuer: "supplier" });
    const internal = rule({ itemTypeId: RAW, issuer: "internal" });
    assert.equal(resolveRequirements([supplier, internal], rawPurchased).length, 2);
  });

  it("ignores rules that match nothing", () => {
    assert.deepEqual(resolveRequirements([rule({})], rawPurchased), []);
  });
});

describe("evaluateDocument", () => {
  it("is current when there is no validity rule", () => {
    assert.equal(evaluateDocument(doc({}), rule({}), now).status, "current");
  });

  it("derives expiry from issue date and validity", () => {
    const r = rule({ validForMonths: 36 });
    const result = evaluateDocument(doc({ issuedAt: new Date("2024-01-01T00:00:00Z") }), r, now);
    assert.equal(result.status, "current");
    assert.deepEqual(result.effectiveExpiresAt, new Date("2027-01-01T00:00:00Z"));
    assert.equal(evaluateDocument(doc({ issuedAt: new Date("2023-01-01T00:00:00Z") }), r, now).status, "expired");
  });

  it("is expiring inside the warning window", () => {
    const r = rule({ validForMonths: 12, warnDays: 60 });
    assert.equal(evaluateDocument(doc({ issuedAt: new Date("2025-07-15T00:00:00Z") }), r, now).status, "expiring");
  });

  it("prefers an explicit expiry date over the computed one", () => {
    const r = rule({ validForMonths: 36 });
    const d = doc({ issuedAt: new Date("2026-01-01T00:00:00Z"), expiresAt: new Date("2026-05-01T00:00:00Z") });
    assert.equal(evaluateDocument(d, r, now).status, "expired");
  });

  it("treats documents issued before the cutoff as expired", () => {
    const r = rule({ minIssuedAt: new Date("2025-01-01T00:00:00Z") });
    assert.equal(evaluateDocument(doc({ issuedAt: new Date("2024-12-31T00:00:00Z") }), r, now).status, "expired");
    assert.equal(evaluateDocument(doc({ issuedAt: new Date("2025-02-01T00:00:00Z") }), r, now).status, "current");
  });

  it("is undated when a validity rule applies but there is no date to check", () => {
    assert.equal(evaluateDocument(doc({}), rule({ validForMonths: 36 }), now).status, "undated");
    assert.equal(evaluateDocument(doc({}), rule({ minIssuedAt: now }), now).status, "undated");
  });

  it("is stale when an internal document's source has been superseded", () => {
    const r = rule({ issuer: "internal" });
    const d = doc({ issuer: "internal", derivedFrom: { supersededAt: new Date("2026-05-01T00:00:00Z") } });
    assert.equal(evaluateDocument(d, r, now).status, "stale");
    assert.equal(evaluateDocument({ ...d, derivedFrom: { supersededAt: null } }, r, now).status, "current");
  });
});

describe("evaluateRequirement (item scope)", () => {
  it("is missing without a matching current document", () => {
    const docs = [
      doc({ fileTypeId: COA }),
      doc({ issuer: "internal" }),
      doc({ supersededAt: new Date("2026-01-01T00:00:00Z") }),
    ];
    assert.equal(evaluateRequirement(rule({}), docs, [], now).status, "missing");
  });

  it("uses the best document when several suppliers have one", () => {
    const r = rule({ validForMonths: 36 });
    const docs = [
      doc({ supplierId: "a", issuedAt: new Date("2020-01-01T00:00:00Z") }),
      doc({ supplierId: "b", issuedAt: new Date("2025-01-01T00:00:00Z") }),
    ];
    const result = evaluateRequirement(r, docs, [], now);
    assert.equal(result.status, "current");
    assert.deepEqual(result.documents.map((d) => d.status), ["current", "expired"]);
  });

  it("accepts either issuer when the requirement says any", () => {
    assert.equal(evaluateRequirement(rule({ issuer: "any" }), [doc({ issuer: "internal" })], [], now).status, "current");
  });
});

describe("evaluateRequirement (lot scope)", () => {
  const received: LotRecord = { id: "lot-r", lotNumber: "R1", originType: "purchaseOrderReceiving" };
  const produced: LotRecord = { id: "lot-p", lotNumber: "P1", originType: "batchProduction" };
  const manual: LotRecord = { id: "lot-m", lotNumber: "M1", originType: "manuallyCreated" };
  const lots = [received, produced, manual];

  it("checks supplier COAs on received lots only", () => {
    const r = rule({ fileTypeId: COA, scope: "lot", issuer: "supplier" });
    const result = evaluateRequirement(r, [], lots, now);
    assert.equal(result.status, "missing");
    assert.deepEqual(
      result.lots!.map((l) => [l.lotNumber, l.counted]),
      [["R1", true], ["P1", false], ["M1", false]]
    );

    const withCoa = evaluateRequirement(r, [doc({ fileTypeId: COA, lotId: received.id })], lots, now);
    assert.equal(withCoa.status, "current");
  });

  it("checks internal COAs on produced lots only", () => {
    const r = rule({ fileTypeId: COA, scope: "lot", issuer: "internal" });
    const docs = [doc({ fileTypeId: COA, issuer: "internal", lotId: produced.id })];
    const result = evaluateRequirement(r, docs, lots, now);
    assert.equal(result.status, "current");
    assert.deepEqual(result.lots!.filter((l) => l.counted).map((l) => l.lotId), [produced.id]);
  });

  it("reports the worst counted lot", () => {
    const second: LotRecord = { id: "lot-r2", lotNumber: "R2", originType: "purchaseOrderReceiving" };
    const r = rule({ fileTypeId: COA, scope: "lot" });
    const docs = [doc({ fileTypeId: COA, lotId: received.id })];
    assert.equal(evaluateRequirement(r, docs, [received, second], now).status, "missing");
  });

  it("is not applicable when no lots count", () => {
    const r = rule({ fileTypeId: COA, scope: "lot" });
    assert.equal(evaluateRequirement(r, [], [produced, manual], now).status, "notApplicable");
  });
});

describe("evaluateItemDocuments", () => {
  it("handles the raw material example", () => {
    const rules = [
      rule({ itemTypeId: RAW, fileTypeId: SDS, issuer: "supplier", validForMonths: 36 }),
      rule({ itemTypeId: RAW, fileTypeId: SDS, issuer: "internal", validForMonths: 36 }),
      rule({ itemTypeId: RAW, fileTypeId: COA, scope: "lot" }),
      rule({ itemTypeId: RAW, fileTypeId: "tds", level: "optional" }),
    ];
    const lots: LotRecord[] = [{ id: "l1", lotNumber: "L1", originType: "purchaseOrderReceiving" }];
    const docs = [doc({ fileTypeId: SDS, issuedAt: new Date("2025-03-01T00:00:00Z") })];
    const results = evaluateItemDocuments(rules, { itemTypeId: RAW, procurementTypeId: PURCHASED }, docs, lots, now);
    const byKey = Object.fromEntries(results.map((r) => [`${r.requirement.fileTypeId}:${r.requirement.issuer}`, r.status]));
    assert.deepEqual(byKey, {
      "sds:supplier": "current",
      "sds:internal": "missing",
      "coa:supplier": "missing",
      "tds:supplier": "missing",
    });
  });
});
