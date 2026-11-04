import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes";
import { selectCoaExamination, specsForCoa } from "./examination";

const record = (lotId: string, typeId: string, createdAt: string) => ({
  id: `${lotId}-${typeId}-${createdAt}`,
  createdAt,
  examinationType: { id: typeId },
  examinedLot: { id: lotId },
});

const spec = (examinationTypeId: string, displayOnCoa: boolean) => ({ examinationTypeId, displayOnCoa, name: examinationTypeId });

describe("selectCoaExamination", () => {
  const lot = "lot-1";
  const other = "lot-2";

  it("uses the latest finished-product examination", () => {
    const older = record(lot, qcExaminationTypes.finishedProduct, "2024-01-01");
    const newer = record(lot, qcExaminationTypes.finishedProduct, "2024-06-01");
    const selected = selectCoaExamination([older, newer], lot);
    assert.equal(selected, newer);
  });

  it("uses the dry examination for a purchased lot that has no finished-product examination", () => {
    const dry = record(lot, qcExaminationTypes.dry, "2024-08-16");
    const inProcess = record(lot, qcExaminationTypes.inProcess, "2024-09-01");
    const selected = selectCoaExamination([inProcess, dry], lot);
    assert.equal(selected, dry);
  });

  it("keeps the finished-product examination when the lot also has a dry examination", () => {
    const dry = record(lot, qcExaminationTypes.dry, "2026-01-01");
    const finished = record(lot, qcExaminationTypes.finishedProduct, "2024-01-01");
    assert.equal(selectCoaExamination([dry, finished], lot), finished);
  });

  it("ignores examinations on other lots", () => {
    const elsewhere = record(other, qcExaminationTypes.dry, "2024-01-01");
    assert.equal(selectCoaExamination([elsewhere], lot), null);
  });

  it("returns null when the lot has no certificate examination", () => {
    const legacy = record(lot, qcExaminationTypes.legacyData, "2024-01-01");
    assert.equal(selectCoaExamination([legacy], lot), null);
  });

  it("recognizes a dry examination by name when its id differs from the static record", () => {
    const dry = {
      id: "db-dry",
      createdAt: "2024-08-16",
      examinationType: { id: "database-dry-id", name: "Dry" },
      examinedLot: { id: lot },
    };
    assert.equal(selectCoaExamination([dry], lot), dry);
  });
});

describe("specsForCoa", () => {
  it("keeps only flagged finished-product specs", () => {
    const shown = spec(qcExaminationTypes.finishedProduct, true);
    const hidden = spec(qcExaminationTypes.finishedProduct, false);
    const dry = spec(qcExaminationTypes.dry, true);
    assert.deepEqual(specsForCoa([shown, hidden, dry], qcExaminationTypes.finishedProduct), [shown]);
  });

  it("includes a purchased lot's dry specs when the import left the certificate flag off", () => {
    const imported = spec(qcExaminationTypes.dry, false);
    const other = spec(qcExaminationTypes.finishedProduct, true);
    assert.deepEqual(specsForCoa([imported, other], qcExaminationTypes.dry), [imported]);
  });

  it("includes dry specs identified by the examination name", () => {
    const imported = spec("database-dry-id", false);
    assert.deepEqual(specsForCoa([imported], "database-dry-id", "Dry"), [imported]);
  });
});
