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
    include: { shape: true, subjectType: true },
    orderBy: { name: "asc" },
  });
};

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

      return { dataType, subject, artifact, live: live?.content ?? null, canEdit, canReview };
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

  // suppliers with a stated fact already; the UI can start one for any other supplier
  const supplierArtifacts = await prisma.canonArtifact.findMany({
    where: { itemId, supplierId: { not: null } },
    select: { supplier: { select: { id: true, name: true } } },
    distinct: ["supplierId"],
  });
  const finishedProducts = await prisma.finishedProduct.findMany({
    where: { filledWithItemId: itemId, recordStatusId: recordStatuses.active },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return {
    item: await buildEntries(userId, itemTypes, { kind: "item", itemId }),
    suppliers: await Promise.all(
      supplierArtifacts.map(async ({ supplier }) => ({
        supplier: supplier!,
        entries: await buildEntries(userId, supplierTypes, { kind: "itemSupplier", itemId, supplierId: supplier!.id }),
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

// Entries for one supplier that has no statements yet, so the UI can add the first one.
export const getSupplierCanonEntries = async (userId: string, itemId: string, supplierId: string) => {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: itemId } });
  const supplierTypes = await getApplicableDataTypes(canonSubjectTypes.itemSupplier, item);
  return buildEntries(userId, supplierTypes, { kind: "itemSupplier", itemId, supplierId });
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
