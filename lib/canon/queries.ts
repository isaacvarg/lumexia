import prisma from "@/lib/prisma";
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities";
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { canUser } from "./permissions";
import { resolveLinked } from "./resolvers";
import { observeLinkedSource, refreshArtifactStatus } from "./status";
import { CanonSubject, toSubjectKey } from "./subjectKey";

const artifactInclude = {
  status: true,
  currentVersion: true,
  _count: { select: { changeRequests: { where: { statusId: canonChangeRequestStatuses.underReview } } } },
} as const;

// Data types that apply to an item: right subject type, active, and within the type's scope.
const getApplicableDataTypes = async (subjectTypeId: string, item: { itemTypeId: string; procurementTypeId: string }) => {
  return prisma.canonDataType.findMany({
    where: {
      subjectTypeId,
      recordStatusId: recordStatuses.active,
      OR: [{ procurementTypeId: null }, { procurementTypeId: item.procurementTypeId }],
      AND: [{ OR: [{ itemTypes: { none: {} } }, { itemTypes: { some: { itemTypeId: item.itemTypeId } } }] }],
    },
    include: {
      shape: true,
      subjectType: true,
      group: true,
      userPermissions: { select: { capabilityId: true } },
      teamPermissions: { select: { capabilityId: true } },
    },
    orderBy: { name: "asc" },
  });
};

const hasGrantees = (dataType: { userPermissions: { capabilityId: string }[]; teamPermissions: { capabilityId: string }[] }, capabilityId: string) =>
  [...dataType.userPermissions, ...dataType.teamPermissions].some((p) => p.capabilityId === capabilityId);

const buildEntries = async (
  userId: string,
  dataTypes: Awaited<ReturnType<typeof getApplicableDataTypes>>,
  subject: CanonSubject,
) => {
  const subjectKey = toSubjectKey(subject);
  const artifacts = await prisma.canonArtifact.findMany({
    where: { subjectKey, dataTypeId: { in: dataTypes.map((d) => d.id) } },
    select: { id: true, dataTypeId: true },
  });

  return Promise.all(
    dataTypes.map(async (dataType) => {
      const existing = artifacts.find((a) => a.dataTypeId === dataType.id);

      // refresh on view: linked sources are re-read, everything else re-checks staleness and expiry
      let live = null;
      if (existing) {
        live = dataType.resolverKey
          ? await observeLinkedSource(prisma, existing.id)
          : (await refreshArtifactStatus(prisma, existing.id), null);
      } else if (dataType.resolverKey) {
        live = await resolveLinked(dataType.resolverKey, subject);
      }

      const [artifact, canEdit, canReview] = await Promise.all([
        existing ? prisma.canonArtifact.findUnique({ where: { id: existing.id }, include: artifactInclude }) : null,
        canUser(userId, dataType.id, canonCapabilities.edit),
        canUser(userId, dataType.id, canonCapabilities.review),
      ]);

      return {
        dataType,
        subject,
        artifact,
        live: live?.content ?? null,
        canEdit,
        canReview,
        // false when nobody at all has been given the capability, so nobody can act yet
        hasEditors: hasGrantees(dataType, canonCapabilities.edit),
        hasReviewers: hasGrantees(dataType, canonCapabilities.review),
      };
    }),
  );
};

export type CanonEntry = Awaited<ReturnType<typeof buildEntries>>[number];

// Everything the Canon tab shows for an item: its own artifacts, its supplier facts,
// and the artifacts of finished products filled with it.
export const getItemCanon = async (userId: string, itemId: string) => {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId } });

  const [itemTypes, supplierTypes, productTypes] = await Promise.all([
    getApplicableDataTypes(canonSubjectTypes.item, item),
    getApplicableDataTypes(canonSubjectTypes.itemSupplier, item),
    getApplicableDataTypes(canonSubjectTypes.finishedProduct, item),
  ]);

  // per-supplier statements that exist; new ones are started for one supplier and one type at a time
  const supplierArtifacts = await prisma.canonArtifact.findMany({
    where: { itemId, supplierId: { not: null }, dataTypeId: { in: supplierTypes.map((d) => d.id) } },
    select: { dataTypeId: true, supplier: { select: { id: true, name: true } } },
    orderBy: { supplier: { name: "asc" } },
  });
  const supplierGroups = new Map<string, { supplier: { id: string; name: string }; dataTypeIds: string[] }>();
  for (const { supplier, dataTypeId } of supplierArtifacts) {
    const group = supplierGroups.get(supplier!.id) ?? { supplier: supplier!, dataTypeIds: [] };
    group.dataTypeIds.push(dataTypeId);
    supplierGroups.set(supplier!.id, group);
  }
  const finishedProducts = await prisma.finishedProduct.findMany({
    where: { filledWithItemId: itemId, recordStatusId: recordStatuses.active },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // supplier statements of item types that allow them, attached to their item value
  const statementTypes = itemTypes.filter((d) => d.allowSupplierStatements);
  const statementArtifacts = await prisma.canonArtifact.findMany({
    where: { itemId, supplierId: { not: null }, dataTypeId: { in: statementTypes.map((d) => d.id) } },
    select: { dataTypeId: true, supplier: { select: { id: true, name: true } } },
    orderBy: { supplier: { name: "asc" } },
  });
  const itemEntries = await buildEntries(userId, itemTypes, { kind: "item", itemId });
  const withStatements = await Promise.all(
    itemEntries.map(async (entry) => ({
      ...entry,
      supplierStatements: entry.dataType.allowSupplierStatements
        ? await Promise.all(
            statementArtifacts
              .filter((a) => a.dataTypeId === entry.dataType.id)
              .map(async ({ supplier }) => ({
                supplier: supplier!,
                entry: (await buildEntries(userId, [entry.dataType], { kind: "itemSupplier", itemId, supplierId: supplier!.id }))[0],
              })),
          )
        : [],
    })),
  );

  return {
    item: withStatements,
    suppliers: await Promise.all(
      Array.from(supplierGroups.values()).map(async ({ supplier, dataTypeIds }) => ({
        supplier,
        entries: await buildEntries(
          userId,
          supplierTypes.filter((d) => dataTypeIds.includes(d.id)),
          { kind: "itemSupplier", itemId, supplierId: supplier.id },
        ),
      })),
    ),
    supplierDataTypes: supplierTypes,
    // files on the item, offered as evidence
    files: await prisma.itemFile.findMany({
      where: { itemId },
      select: { fileId: true, file: { select: { name: true } }, fileType: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    finishedProducts: await Promise.all(
      finishedProducts.map(async (fp) => ({
        finishedProduct: fp,
        entries: await buildEntries(userId, productTypes, { kind: "finishedProduct", finishedProductId: fp.id }),
      })),
    ),
  };
};

export type ItemCanon = Awaited<ReturnType<typeof getItemCanon>>;

export type ItemCanonEntry = ItemCanon["item"][number];

// One data type for one supplier, so the UI can start that single statement.
export const getSupplierCanonEntry = async (userId: string, itemId: string, supplierId: string, dataTypeId: string) => {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId } });
  const [supplierTypes, itemTypes] = await Promise.all([
    getApplicableDataTypes(canonSubjectTypes.itemSupplier, item),
    getApplicableDataTypes(canonSubjectTypes.item, item),
  ]);
  // legacy per-supplier types, or item types that allow supplier statements
  const dataType = [...supplierTypes, ...itemTypes.filter((d) => d.allowSupplierStatements)].find((d) => d.id === dataTypeId);
  if (!dataType) throw new Error("That data type doesn't apply to this item.");
  const [entry] = await buildEntries(userId, [dataType], { kind: "itemSupplier", itemId, supplierId });
  return entry;
};

// The full history behind an artifact: every version with its CR, reviews, evidence and lineage,
// plus non-version events. The UI merges both into one timeline.
export const getArtifactHistory = async (artifactId: string) => {
  return prisma.canonArtifact.findUniqueOrThrow({
    where: { id: artifactId },
    include: {
      dataType: { include: { shape: true } },
      status: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        include: {
          changeRequest: {
            include: {
              kind: true,
              requestedBy: { select: { id: true, name: true, image: true } },
              reviews: { include: { reviewer: { select: { id: true, name: true, image: true } } } },
              sources: { include: { sourceType: true, file: true } },
            },
          },
          upstream: {
            include: {
              upstreamVersion: {
                select: {
                  id: true,
                  versionNumber: true,
                  artifact: { select: { id: true, subjectKey: true, dataType: { select: { name: true } } } },
                },
              },
            },
          },
        },
      },
      changeRequests: {
        where: { statusId: { not: canonChangeRequestStatuses.approved } },
        orderBy: { createdAt: "desc" },
        include: {
          kind: true,
          status: true,
          requestedBy: { select: { id: true, name: true, image: true } },
          reviews: { include: { reviewer: { select: { id: true, name: true, image: true } } } },
          sources: { include: { sourceType: true, file: true } },
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: { eventType: true, user: { select: { id: true, name: true } } },
      },
    },
  });
};

// For a scheduled sweep: catches expiries and linked-source edits nobody has viewed yet.
export const refreshAllArtifacts = async () => {
  const artifacts = await prisma.canonArtifact.findMany({
    select: { id: true, dataType: { select: { resolverKey: true } } },
  });
  for (const artifact of artifacts) {
    if (artifact.dataType.resolverKey) await observeLinkedSource(prisma, artifact.id);
    else await refreshArtifactStatus(prisma, artifact.id);
  }
  return artifacts.length;
};

// Data types where the user holds a capability, directly or through a team.
const dataTypeIdsFor = async (userId: string, capabilityId: string): Promise<string[]> => {
  const [direct, viaTeam] = await Promise.all([
    prisma.canonDataTypeUserPermission.findMany({ where: { userId, capabilityId }, select: { dataTypeId: true } }),
    prisma.canonDataTypeTeamPermission.findMany({
      where: { capabilityId, team: { members: { some: { userId } } } },
      select: { dataTypeId: true },
    }),
  ]);
  return Array.from(new Set([...direct, ...viaTeam].map((p) => p.dataTypeId)));
};

const subjectSelect = {
  item: { select: { id: true, name: true, referenceCode: true } },
  supplier: { select: { name: true } },
  finishedProduct: { select: { name: true, filledWithItem: { select: { id: true, name: true, referenceCode: true } } } },
} as const;

// What a user should act on: change requests waiting for their decision, and artifacts
// they edit or review that need attention.
export const getReviewQueue = async (userId: string) => {
  const [reviewTypeIds, editTypeIds] = await Promise.all([
    dataTypeIdsFor(userId, canonCapabilities.review),
    dataTypeIdsFor(userId, canonCapabilities.edit),
  ]);

  const changeRequests = await prisma.canonChangeRequest.findMany({
    where: {
      statusId: canonChangeRequestStatuses.underReview,
      artifact: { dataTypeId: { in: reviewTypeIds } },
      reviews: { none: { reviewerId: userId } },
      // their own CR can't be approved by them when the type needs a different reviewer
      NOT: { requestedById: userId, artifact: { dataType: { requiresDifferentReviewer: true } } },
    },
    include: {
      kind: { select: { name: true } },
      requestedBy: { select: { name: true, image: true } },
      artifact: { include: { dataType: { select: { name: true } }, ...subjectSelect } },
    },
    orderBy: { createdAt: "asc" },
  });

  const attention = await prisma.canonArtifact.findMany({
    where: {
      dataTypeId: { in: Array.from(new Set([...reviewTypeIds, ...editTypeIds])) },
      OR: [{ isStale: true }, { hasUnreviewedChange: true }, { isExpired: true }, { hasConflict: true }],
    },
    include: { status: true, dataType: { select: { name: true } }, ...subjectSelect },
    orderBy: { updatedAt: "asc" },
  });

  return { changeRequests, attention };
};

export type ReviewQueue = Awaited<ReturnType<typeof getReviewQueue>>;
