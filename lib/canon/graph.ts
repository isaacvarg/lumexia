import { CanonArtifact } from "@prisma/client";
import { canonDependencyKinds } from "@/configs/staticRecords/canonDependencyKinds";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { Db } from "./db";
import { CanonSubject, toSubjectKey } from "./subjectKey";

// Turns the type-level dependency graph into artifact-level parents and children.

export const subjectOf = (artifact: Pick<CanonArtifact, "itemId" | "finishedProductId" | "supplierId">): CanonSubject => {
  if (artifact.finishedProductId) return { kind: "finishedProduct", finishedProductId: artifact.finishedProductId };
  if (artifact.supplierId) return { kind: "itemSupplier", itemId: artifact.itemId!, supplierId: artifact.supplierId };
  return { kind: "item", itemId: artifact.itemId! };
};

const allowsSupplierStatements = async (db: Db, dataTypeId: string) => {
  const dataType = await db.canonDataType.findUnique({ where: { id: dataTypeId }, select: { allowSupplierStatements: true } });
  return !!dataType?.allowSupplierStatements;
};

const activeBomItemIds = async (db: Db, itemId: string): Promise<string[]> => {
  const lines = await db.billOfMaterial.findMany({
    where: {
      recordStatusId: recordStatuses.active,
      mbpr: { producesItemId: itemId, recordStatusId: recordStatuses.active },
    },
    select: { itemId: true },
  });
  return Array.from(new Set(lines.map((l) => l.itemId)));
};

// Items whose active MBPR uses this material.
const itemsUsingMaterial = async (db: Db, materialId: string): Promise<string[]> => {
  const lines = await db.billOfMaterial.findMany({
    where: {
      itemId: materialId,
      recordStatusId: recordStatuses.active,
      mbpr: { recordStatusId: recordStatuses.active },
    },
    select: { mbpr: { select: { producesItemId: true } } },
  });
  return Array.from(new Set(lines.map((l) => l.mbpr.producesItemId)));
};

// The parent artifacts that exist for a child artifact, across every dependency of its type.
export const getParentArtifacts = async (db: Db, child: CanonArtifact) => {
  const dependencies = await db.canonDataTypeDependency.findMany({ where: { childId: child.dataTypeId } });
  const subject = subjectOf(child);
  const parents: CanonArtifact[] = [];

  // an item value depends on the supplier statements of the same type, when the type allows them
  if (subject.kind === "item" && (await allowsSupplierStatements(db, child.dataTypeId))) {
    parents.push(
      ...(await db.canonArtifact.findMany({
        where: { dataTypeId: child.dataTypeId, itemId: subject.itemId, supplierId: { not: null } },
      })),
    );
  }

  for (const dep of dependencies) {
    let subjectKeys: string[] = [];

    if (dep.kindId === canonDependencyKinds.sameSubject) {
      subjectKeys = [child.subjectKey];
    } else if (dep.kindId === canonDependencyKinds.activeBom && subject.kind === "item") {
      subjectKeys = (await activeBomItemIds(db, subject.itemId)).map((itemId) => toSubjectKey({ kind: "item", itemId }));
    } else if (dep.kindId === canonDependencyKinds.suppliers && subject.kind === "item") {
      parents.push(
        ...(await db.canonArtifact.findMany({
          where: { dataTypeId: dep.parentId, itemId: subject.itemId, supplierId: { not: null } },
        })),
      );
      continue;
    } else if (dep.kindId === canonDependencyKinds.filledItem && subject.kind === "finishedProduct") {
      const fp = await db.finishedProduct.findUnique({
        where: { id: subject.finishedProductId },
        select: { filledWithItemId: true },
      });
      if (fp) subjectKeys = [toSubjectKey({ kind: "item", itemId: fp.filledWithItemId })];
    }

    if (subjectKeys.length > 0) {
      parents.push(
        ...(await db.canonArtifact.findMany({
          where: { dataTypeId: dep.parentId, subjectKey: { in: subjectKeys } },
        })),
      );
    }
  }

  return parents;
};

// The child artifacts that exist for a parent artifact. Used to propagate staleness.
export const getChildArtifacts = async (db: Db, parent: CanonArtifact) => {
  const dependencies = await db.canonDataTypeDependency.findMany({ where: { parentId: parent.dataTypeId } });
  const subject = subjectOf(parent);
  const children: CanonArtifact[] = [];

  // a supplier statement feeds the item value of the same type
  if (subject.kind === "itemSupplier" && (await allowsSupplierStatements(db, parent.dataTypeId))) {
    children.push(
      ...(await db.canonArtifact.findMany({
        where: { dataTypeId: parent.dataTypeId, subjectKey: toSubjectKey({ kind: "item", itemId: subject.itemId }) },
      })),
    );
  }

  for (const dep of dependencies) {
    let subjectKeys: string[] = [];

    if (dep.kindId === canonDependencyKinds.sameSubject) {
      subjectKeys = [parent.subjectKey];
    } else if (dep.kindId === canonDependencyKinds.activeBom && subject.kind === "item") {
      subjectKeys = (await itemsUsingMaterial(db, subject.itemId)).map((itemId) => toSubjectKey({ kind: "item", itemId }));
    } else if (dep.kindId === canonDependencyKinds.suppliers && subject.kind === "itemSupplier") {
      subjectKeys = [toSubjectKey({ kind: "item", itemId: subject.itemId })];
    } else if (dep.kindId === canonDependencyKinds.filledItem && subject.kind === "item") {
      const fps = await db.finishedProduct.findMany({
        where: { filledWithItemId: subject.itemId, recordStatusId: recordStatuses.active },
        select: { id: true },
      });
      subjectKeys = fps.map((fp) => toSubjectKey({ kind: "finishedProduct", finishedProductId: fp.id }));
    }

    if (subjectKeys.length > 0) {
      children.push(
        ...(await db.canonArtifact.findMany({
          where: { dataTypeId: dep.childId, subjectKey: { in: subjectKeys } },
        })),
      );
    }
  }

  return children;
};

// Would adding parent → child create a cycle? (Is parent already reachable from child?)
export const createsCycle = async (db: Db, parentId: string, childId: string): Promise<boolean> => {
  if (parentId === childId) return true;
  const edges = await db.canonDataTypeDependency.findMany({ select: { parentId: true, childId: true } });

  const queue = [childId];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === parentId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    edges.filter((e) => e.parentId === current).forEach((e) => queue.push(e.childId));
  }
  return false;
};
