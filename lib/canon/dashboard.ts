import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses";
import { canonEventTypes } from "@/configs/staticRecords/canonEventTypes";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { getReviewQueue } from "./queries";

const MISSING_LIMIT = 50;

const subjectSelect = {
  item: { select: { id: true, name: true, referenceCode: true } },
  supplier: { select: { name: true } },
  finishedProduct: { select: { name: true, filledWithItem: { select: { id: true, name: true, referenceCode: true } } } },
} as const;

// events a version already explains; the activity feed shows the version event instead
const quietEvents = [canonEventTypes.changeRequestOpened, canonEventTypes.changeRequestApproved];

type ScopedType = { subjectTypeId: string; procurementTypeId: string | null; itemTypes: { itemTypeId: string }[] };

// the items a data type applies to (for finished products: the item they're filled with)
const itemScope = (dataType: ScopedType): Prisma.ItemWhereInput => ({
  recordStatusId: { not: recordStatuses.archived },
  ...(dataType.procurementTypeId ? { procurementTypeId: dataType.procurementTypeId } : {}),
  ...(dataType.itemTypes.length > 0 ? { itemTypeId: { in: dataType.itemTypes.map((t) => t.itemTypeId) } } : {}),
});

// How many subjects a type applies to, and which of them have no accepted value yet.
// Supplier statements have no fixed set of subjects, so they report artifacts only.
const coverageFor = async (dataType: ScopedType & { id: string }) => {
  if (dataType.subjectTypeId === canonSubjectTypes.item) {
    const where = itemScope(dataType);
    const missingWhere: Prisma.ItemWhereInput = {
      ...where,
      // the item value itself; supplier statements of the same type don't count
      CanonArtifact: { none: { dataTypeId: dataType.id, supplierId: null, currentVersionId: { not: null } } },
    };
    const [applicable, missingCount, missing] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.count({ where: missingWhere }),
      prisma.item.findMany({
        where: missingWhere,
        select: { id: true, name: true, referenceCode: true },
        orderBy: { name: "asc" },
        take: MISSING_LIMIT,
      }),
    ]);
    return { applicable, missingCount, missing: missing.map((i) => ({ label: i.name, item: i })) };
  }

  if (dataType.subjectTypeId === canonSubjectTypes.finishedProduct) {
    const where: Prisma.FinishedProductWhereInput = {
      recordStatusId: recordStatuses.active,
      filledWithItem: itemScope(dataType),
    };
    const missingWhere: Prisma.FinishedProductWhereInput = {
      ...where,
      CanonArtifact: { none: { dataTypeId: dataType.id, currentVersionId: { not: null } } },
    };
    const [applicable, missingCount, missing] = await Promise.all([
      prisma.finishedProduct.count({ where }),
      prisma.finishedProduct.count({ where: missingWhere }),
      prisma.finishedProduct.findMany({
        where: missingWhere,
        select: { name: true, filledWithItem: { select: { id: true, name: true, referenceCode: true } } },
        orderBy: { name: "asc" },
        take: MISSING_LIMIT,
      }),
    ]);
    return { applicable, missingCount, missing: missing.map((fp) => ({ label: fp.name, item: fp.filledWithItem })) };
  }

  return { applicable: null, missingCount: null, missing: [] };
};

export const getCanonDashboard = async (userId: string) => {
  const dataTypes = await prisma.canonDataType.findMany({
    where: { recordStatusId: recordStatuses.active },
    include: { shape: true, subjectType: true, group: true, itemTypes: { select: { itemTypeId: true } } },
    orderBy: [{ group: { sequence: "asc" } }, { group: { name: "asc" } }, { name: "asc" }],
  });

  const [statusCounts, attention, changeRequests, events, queue, coverage] = await Promise.all([
    prisma.canonArtifact.groupBy({
      by: ["dataTypeId", "statusId"],
      // item values only: supplier statements are tracked under their item value
      where: {
        dataTypeId: { in: dataTypes.map((d) => d.id) },
        OR: [{ supplierId: null }, { dataType: { subjectTypeId: canonSubjectTypes.itemSupplier } }],
      },
      _count: { _all: true },
    }),
    prisma.canonArtifact.findMany({
      where: {
        dataTypeId: { in: dataTypes.map((d) => d.id) },
        OR: [{ isStale: true }, { hasUnreviewedChange: true }, { isExpired: true }, { hasConflict: true }],
      },
      include: { status: true, dataType: { select: { id: true, name: true } }, currentVersion: { select: { versionNumber: true } }, ...subjectSelect },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.canonChangeRequest.findMany({
      where: { statusId: canonChangeRequestStatuses.underReview },
      include: {
        kind: { select: { name: true } },
        requestedBy: { select: { name: true, image: true } },
        reviews: { select: { approved: true } },
        artifact: { include: { dataType: { select: { name: true, requiredApprovals: true } }, ...subjectSelect } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.canonArtifactEvent.findMany({
      where: { eventTypeId: { notIn: quietEvents } },
      include: {
        eventType: { select: { name: true } },
        user: { select: { name: true } },
        version: { select: { versionNumber: true } },
        artifact: { include: { dataType: { select: { name: true } }, ...subjectSelect } },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    getReviewQueue(userId),
    Promise.all(dataTypes.map((d) => coverageFor(d))),
  ]);

  const types = dataTypes.map((dataType, i) => {
    const counts = Object.fromEntries(
      statusCounts.filter((c) => c.dataTypeId === dataType.id).map((c) => [c.statusId, c._count._all]),
    ) as Record<string, number>;
    return { dataType, counts, ...coverage[i] };
  });

  const applicable = types.reduce((sum, t) => sum + (t.applicable ?? 0), 0);
  const missing = types.reduce((sum, t) => sum + (t.missingCount ?? 0), 0);

  return {
    summary: {
      coverage: applicable === 0 ? null : (applicable - missing) / applicable,
      covered: applicable - missing,
      applicable,
      needsAttention: attention.length,
      openChangeRequests: changeRequests.length,
      waitingForMe: queue.changeRequests.length,
    },
    types,
    attention,
    changeRequests,
    events,
  };
};

export type CanonDashboard = Awaited<ReturnType<typeof getCanonDashboard>>;
