// CanonArtifact.subjectKey: a single non-null string per subject, so
// @@unique([dataTypeId, subjectKey]) actually prevents duplicates.

export type CanonSubject =
  | { kind: "item"; itemId: string }
  | { kind: "finishedProduct"; finishedProductId: string }
  | { kind: "itemSupplier"; itemId: string; supplierId: string };

export const toSubjectKey = (subject: CanonSubject): string => {
  switch (subject.kind) {
    case "item":
      return `item:${subject.itemId}`;
    case "finishedProduct":
      return `fp:${subject.finishedProductId}`;
    case "itemSupplier":
      return `item:${subject.itemId}|supplier:${subject.supplierId}`;
  }
};

// the foreign key columns to store alongside the key
export const toSubjectColumns = (subject: CanonSubject) => ({
  itemId: subject.kind === "finishedProduct" ? null : subject.itemId,
  finishedProductId: subject.kind === "finishedProduct" ? subject.finishedProductId : null,
  supplierId: subject.kind === "itemSupplier" ? subject.supplierId : null,
});
