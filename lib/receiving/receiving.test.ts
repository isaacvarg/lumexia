import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planLine } from "./plan";
import { lineFlags, lotFlags } from "./flags";
import { failedChecks, unansweredChecks } from "./checks";
import { EvaluatedRequirement, Requirement } from "@/lib/itemDocuments/types";

const requirement = (overrides: Partial<Requirement>): Requirement => ({
  id: "r",
  itemTypeId: "raw",
  procurementTypeId: null,
  sold: null,
  fileTypeId: "coa",
  level: "required",
  scope: "lot",
  issuer: "supplier",
  lotOrigin: null,
  validForMonths: null,
  minIssuedAt: null,
  warnDays: 60,
  notes: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

const lotResult = (r: Requirement, lotId: string, status: EvaluatedRequirement["status"], counted = true): EvaluatedRequirement => ({
  requirement: r,
  status,
  documents: [],
  lots: [{ lotId, lotNumber: "L1", counted, status, documents: [] }],
});

describe("planLine", () => {
  it("receives the whole line", () => {
    assert.deepEqual(planLine(100, [60, 40]), { received: 100, remainder: 0, overReceived: false });
  });

  it("keeps the rest open when short", () => {
    assert.deepEqual(planLine(100, [60]), { received: 60, remainder: 40, overReceived: false });
  });

  it("flags more than ordered", () => {
    assert.deepEqual(planLine(100, [70, 40]), { received: 110, remainder: 0, overReceived: true });
  });

  it("ignores float noise", () => {
    assert.equal(planLine(0.3, [0.1, 0.2]).remainder, 0);
    assert.equal(planLine(0.3, [0.1, 0.2]).overReceived, false);
  });
});

describe("receiving flags", () => {
  it("flags the line from inspection and quantity", () => {
    assert.deepEqual(lineFlags({ hasIssue: false, openQuantity: 10, receivedQuantity: 10 }), []);
    assert.deepEqual(lineFlags({ hasIssue: true, openQuantity: 10, receivedQuantity: 12 }), ["inspection", "overReceived"]);
    assert.deepEqual(lineFlags({ hasIssue: false, openQuantity: 10, receivedQuantity: 4 }), ["shortReceived"]);
  });

  it("flags a lot without a supplier lot or with missing documents", () => {
    const coa = requirement({});
    assert.deepEqual(lotFlags({ id: "l1", supplierLotNumber: null }, [lotResult(coa, "l1", "missing")]), ["noSupplierLot", "docsMissing"]);
    assert.deepEqual(lotFlags({ id: "l1", supplierLotNumber: "AB1" }, [lotResult(coa, "l1", "current")]), []);
  });

  it("only counts required documents as missing, and lots the requirement counts", () => {
    const optional = requirement({ level: "optional" });
    assert.deepEqual(lotFlags({ id: "l1", supplierLotNumber: "AB1" }, [lotResult(optional, "l1", "missing")]), []);
    assert.deepEqual(lotFlags({ id: "l1", supplierLotNumber: "AB1" }, [lotResult(requirement({}), "l1", "missing", false)]), []);
  });

  it("flags a COA for another supplier lot", () => {
    assert.deepEqual(lotFlags({ id: "l1", supplierLotNumber: "AB1" }, [lotResult(requirement({}), "l1", "mismatch")]), ["lotMismatch"]);
  });
});

describe("checks", () => {
  it("lists failed and unanswered checks", () => {
    const answers = { rightItem: "pass", packaging: "fail", seals: "na" } as const;
    assert.deepEqual(failedChecks(answers).map((c) => c.key), ["packaging"]);
    assert.deepEqual(unansweredChecks(answers).map((c) => c.key), ["labels", "quantity"]);
  });
});
