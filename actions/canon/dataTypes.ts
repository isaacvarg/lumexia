"use server";

import prisma from "@/lib/prisma";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { canonResolvers, getResolver } from "@/lib/canon/resolvers";
import { getShapeKey } from "@/lib/canon/shapes";

type DataTypeInput = {
  name: string;
  description?: string | null;
  shapeId: string;
  subjectTypeId: string;
  shapeConfig?: unknown;
  resolverKey?: string | null;
  externalKey?: string | null;
  requiredApprovals?: number;
  requiresDifferentReviewer?: boolean;
  requiresEvidence?: boolean;
  reverifyAfterDays?: number | null;
  procurementTypeId?: string | null;
  itemTypeIds?: string[];
};

const subjectKindById: Record<string, string> = {
  [canonSubjectTypes.item]: "item",
  [canonSubjectTypes.finishedProduct]: "finishedProduct",
  [canonSubjectTypes.itemSupplier]: "itemSupplier",
};

// a linked type's shape and subject come from its resolver
const validateResolver = (input: Pick<DataTypeInput, "resolverKey" | "shapeId" | "subjectTypeId">) => {
  if (!input.resolverKey) return;
  const resolver = getResolver(input.resolverKey);
  if (resolver.shapeKey !== getShapeKey(input.shapeId)) {
    throw new Error(`${resolver.label} produces ${resolver.shapeKey}; pick that shape.`);
  }
  if (resolver.subjectKind !== subjectKindById[input.subjectTypeId]) {
    throw new Error(`${resolver.label} applies to ${resolver.subjectKind} subjects.`);
  }
};

const validateApprovals = (input: Pick<DataTypeInput, "requiredApprovals">) => {
  if (input.requiredApprovals !== undefined && input.requiredApprovals < 1) {
    throw new Error("A data type needs at least one approval.");
  }
};

export const getAllCanonDataTypes = async () => {
  return prisma.canonDataType.findMany({
    where: { recordStatusId: { not: recordStatuses.archived } },
    include: {
      shape: true,
      subjectType: true,
      procurementType: true,
      itemTypes: { include: { itemType: true } },
      userPermissions: { include: { user: { select: { id: true, name: true, image: true } }, capability: true } },
      teamPermissions: { include: { team: true, capability: true } },
      parents: { include: { kind: true } },
      children: { include: { kind: true } },
      _count: { select: { artifacts: true } },
    },
    orderBy: { name: "asc" },
  });
};

// for the settings dropdown
export const getCanonResolverOptions = async () => {
  return canonResolvers.map(({ key, label, description, shapeKey, subjectKind }) => ({
    key,
    label,
    description,
    shapeKey,
    subjectKind,
  }));
};

export const createCanonDataType = async (input: DataTypeInput) => {
  validateResolver(input);
  validateApprovals(input);

  const { itemTypeIds = [], shapeConfig, ...data } = input;
  return prisma.canonDataType.create({
    data: {
      ...data,
      name: data.name.trim(),
      shapeConfig: (shapeConfig ?? undefined) as any,
      recordStatusId: recordStatuses.active,
      itemTypes: { create: itemTypeIds.map((itemTypeId) => ({ itemTypeId })) },
    },
  });
};

export const updateCanonDataType = async (id: string, input: Partial<DataTypeInput>) => {
  const existing = await prisma.canonDataType.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { artifacts: true } } },
  });

  // existing artifact content would no longer match
  const structural = ["shapeId", "subjectTypeId", "resolverKey"] as const;
  if (existing._count.artifacts > 0 && structural.some((k) => input[k] !== undefined && input[k] !== existing[k])) {
    throw new Error("Shape, subject and source can't change once artifacts exist. Create a new data type instead.");
  }

  validateResolver({
    resolverKey: input.resolverKey !== undefined ? input.resolverKey : existing.resolverKey,
    shapeId: input.shapeId ?? existing.shapeId,
    subjectTypeId: input.subjectTypeId ?? existing.subjectTypeId,
  });
  validateApprovals(input);

  const { itemTypeIds, shapeConfig, ...data } = input;
  return prisma.$transaction(async (tx) => {
    if (itemTypeIds) {
      await tx.canonDataTypeItemType.deleteMany({ where: { dataTypeId: id } });
      await tx.canonDataTypeItemType.createMany({
        data: itemTypeIds.map((itemTypeId) => ({ dataTypeId: id, itemTypeId })),
      });
    }
    return tx.canonDataType.update({
      where: { id },
      data: { ...data, name: data.name?.trim(), shapeConfig: shapeConfig === undefined ? undefined : (shapeConfig as any) },
    });
  });
};

// archived types keep their artifacts and history but stop applying to items
export const archiveCanonDataType = async (id: string) => {
  return prisma.canonDataType.update({ where: { id }, data: { recordStatusId: recordStatuses.archived } });
};

export const setCanonDataTypePosition = async (id: string, x: number, y: number) => {
  return prisma.canonDataType.update({ where: { id }, data: { canvasX: x, canvasY: y } });
};
