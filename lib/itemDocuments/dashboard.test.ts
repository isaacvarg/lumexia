import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildDocumentIssues } from "./dashboard";
import { EvaluatedRequirement, Requirement } from "./types";

const requirement = (overrides: Partial<Requirement>): Requirement => ({
  id: "req",
  itemTypeId: "raw",
  procurementTypeId: null,
  fileTypeId: "sds",
  level: "required",
  scope: "item",
  issuer: "supplier",
  validForMonths: null,
  minIssuedAt: null,
  warnDays: 60,
  notes: null,
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

const evaluated = (overrides: Partial<EvaluatedRequirement> & { requirement: Requirement }): EvaluatedRequirement => ({
  status: "missing",
  documents: [],
  lots: null,
  ...overrides,
});

const ctx = {
  documentSuppliers: new Map<string, string | null>([["doc-a", "sup-doc"], ["doc-b", null]]),
  lotSuppliers: new Map([["lot-1", "sup-lot"]]),
  lastSuppliers: new Map([["item", "sup-history"]]),
};

const build = (requirements: EvaluatedRequirement[]) =>
  buildDocumentIssues([{ itemId: "item", itemTypeId: "raw", requirements }], ctx);

describe("buildDocumentIssues", () => {
  it("skips current, optional and not-applicable requirements", () => {
    const issues = build([
      evaluated({ requirement: requirement({ id: "a" }), status: "current" }),
      evaluated({ requirement: requirement({ id: "b", level: "optional" }), status: "missing" }),
      evaluated({ requirement: requirement({ id: "c", scope: "lot" }), status: "notApplicable", lots: [] }),
    ]);
    assert.deepEqual(issues, []);
  });

  it("attributes a supplier from the document, then purchase history", () => {
    const issues = build([
      evaluated({
        requirement: requirement({ id: "a" }),
        status: "expired",
        documents: [{ documentId: "doc-a", status: "expired", effectiveExpiresAt: new Date("2026-01-01") }],
      }),
      evaluated({ requirement: requirement({ id: "b", fileTypeId: "tds" }), status: "missing" }),
    ]);
    assert.deepEqual(
      issues.map((i) => [i.requirementId, i.supplierId, i.supplierSource]),
      [["a", "sup-doc", "document"], ["b", "sup-history", "purchaseHistory"]]
    );
  });

  it("never attributes internal documents to a supplier", () => {
    const [issue] = build([evaluated({ requirement: requirement({ issuer: "internal" }), status: "missing" })]);
    assert.equal(issue.supplierId, null);
    assert.equal(issue.supplierSource, null);
  });

  it("creates one issue per counted lot that needs attention, using the lot's PO supplier", () => {
    const issues = build([
      evaluated({
        requirement: requirement({ fileTypeId: "coa", scope: "lot" }),
        status: "missing",
        lots: [
          { lotId: "lot-1", lotNumber: "L1", counted: true, status: "missing", documents: [] },
          { lotId: "lot-2", lotNumber: "L2", counted: true, status: "current", documents: [] },
          { lotId: "lot-3", lotNumber: "L3", counted: false, status: "missing", documents: [] },
          { lotId: "lot-4", lotNumber: "L4", counted: true, status: "missing", documents: [] },
        ],
      }),
    ]);
    // a lot without a PO supplier doesn't fall back to purchase history: it may not have come from that supplier
    assert.deepEqual(
      issues.map((i) => [i.lotId, i.supplierId, i.supplierSource]),
      [["lot-1", "sup-lot", "lot"], ["lot-4", null, null]]
    );
  });
});
