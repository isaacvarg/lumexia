import { qcExaminationTypes } from "@/configs/staticRecords/qcExaminationTypes";

// A certificate is built from one examination on the lot. Produced lots are
// examined as finished product. Purchased lots are examined as dry: the
// supplier-certificate workflow writes that record, and it is the certificate
// source when no finished-product examination exists.

type CoaExamRecord = {
  createdAt: Date | string;
  examinationType: { id: string; name?: string };
  examinedLot?: { id: string } | null;
};

const isFinishedProduct = (record: CoaExamRecord) =>
  record.examinationType.id === qcExaminationTypes.finishedProduct || record.examinationType.name === "Finished Product";

const isDry = (record: CoaExamRecord) =>
  record.examinationType.id === qcExaminationTypes.dry || record.examinationType.name === "Dry";

const newest = <T extends { createdAt: Date | string }>(records: T[]): T =>
  [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

export class CoaHasNoResults extends Error {
  constructor() {
    super("This examination has no confirmed results to put on a certificate.");
    this.name = "CoaHasNoResults";
  }
}

export const selectCoaExamination = <T extends CoaExamRecord>(records: T[], lotId: string): T | null => {
  const forLot = records.filter((record) => record.examinedLot?.id === lotId);
  const finished = forLot.filter(isFinishedProduct);
  if (finished.length > 0) return newest(finished);
  const dry = forLot.filter(isDry);
  if (dry.length > 0) return newest(dry);
  return null;
};

type CoaSpec = {
  displayOnCoa: boolean;
  examinationTypeId: string;
};

// Finished-product certificates list only specs flagged for the certificate.
// A dry examination's specs are the purchased lot's limits (often recorded by
// the supplier-certificate import with the flag left off), so they all print.
export const specsForCoa = <T extends CoaSpec>(
  specifications: T[],
  examinationTypeId: string,
  examinationTypeName?: string,
): T[] => {
  const forExam = specifications.filter((spec) => spec.examinationTypeId === examinationTypeId);
  const dry = examinationTypeId === qcExaminationTypes.dry || examinationTypeName === "Dry";
  if (dry) return forExam;
  return forExam.filter((spec) => spec.displayOnCoa);
};
