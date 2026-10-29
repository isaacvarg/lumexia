import type { Db } from "@/lib/canon/db";
import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes";
import { qcRecordStatuses } from "@/configs/staticRecords/qcRecordStatuses";
import type { CoaImportReport } from "./importCoa";

// What waits for a person after supplier COAs were imported: baselines to approve, results to confirm,
// lots that failed their baseline, and lots with missing or extra tests. Read-only; the actions come with
// the approval tools.

const itemSelect = { id: true, name: true, referenceCode: true } as const;

// Lots whose dry QC record failed the baseline, for the receiving flags.
export const outOfSpecLotIds = async (db: Db, lotIds: string[]) => {
  if (!lotIds.length) return new Set<string>();
  const records = await db.qcRecord.findMany({
    where: { examinedLotId: { in: lotIds }, examinationTypeId: qcExaminationTypes.dry, statusId: qcRecordStatuses.outOfSpecification },
    select: { examinedLotId: true },
  });
  return new Set(records.map((r) => r.examinedLotId));
};

export const getQcReviewQueue = async (db: Db) => {
  const [pendingBaselines, needsReview, outOfSpec, imports] = await Promise.all([
    db.qcItemBaseline.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, item: { select: itemSelect }, sourceItemFile: { select: { id: true, supplierLotNumber: true, file: { select: { name: true } } } } },
    }),
    db.qcParameterResult.findMany({
      where: { reviewState: "needsReview", source: "supplierCoa" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        value: true,
        reviewReasons: true,
        computedOutcome: true,
        suggestedOutcome: true,
        supplierOutcome: true,
        qcItemParameter: { select: { parameter: { select: { name: true, uom: true } } } },
        qcRecord: { select: { examinedLot: { select: { id: true, lotNumber: true, item: { select: itemSelect } } } } },
      },
    }),
    db.qcRecord.findMany({
      where: { examinationTypeId: qcExaminationTypes.dry, statusId: qcRecordStatuses.outOfSpecification },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        examinedLot: { select: { id: true, lotNumber: true, item: { select: itemSelect } } },
        qcParameterResults: { where: { computedOutcome: "fail" }, select: { id: true, value: true, qcItemParameter: { select: { parameter: { select: { name: true, uom: true } } } } } },
      },
    }),
    db.qcCoaImport.findMany({ where: { supersededAt: null }, orderBy: { createdAt: "asc" }, select: { id: true, report: true, lot: { select: { id: true, lotNumber: true, item: { select: itemSelect } } } } }),
  ]);

  const gaps = imports
    .map((i) => ({ id: i.id, lot: i.lot, report: i.report as unknown as CoaImportReport }))
    .filter((i) => i.report?.missingTests?.length || i.report?.proposedAdditions?.length)
    .map((i) => ({ id: i.id, lot: i.lot, missingTests: i.report.missingTests, proposedAdditions: i.report.proposedAdditions }));

  return { pendingBaselines, needsReview, outOfSpec, gaps, total: pendingBaselines.length + needsReview.length + outOfSpec.length + gaps.length };
};

export type QcReviewQueue = Awaited<ReturnType<typeof getQcReviewQueue>>;
