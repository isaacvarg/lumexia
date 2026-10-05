import prisma from "@/lib/prisma";
import { canonArtifactStatuses } from "@/configs/staticRecords/canonArtifactStatuses";
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities";
import { canonChangeRequestKinds } from "@/configs/staticRecords/canonChangeRequestKinds";
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses";
import { canonEventTypes } from "@/configs/staticRecords/canonEventTypes";
import { canonSourceTypes } from "@/configs/staticRecords/canonSourceTypes";
import { canonSubjectTypes } from "@/configs/staticRecords/canonSubjectTypes";
import { Db } from "./db";
import { evaluateReviews } from "./approval";
import { getChildArtifacts, getParentArtifacts, subjectOf } from "./graph";
import { canUser } from "./permissions";
import { resolveLinked } from "./resolvers";
import { getShapeKey, parseContent, validateTagSet } from "./shapes";
import { refreshArtifactStatus } from "./status";
import { CanonSubject, toSubjectColumns, toSubjectKey } from "./subjectKey";

export type CanonSourceInput = {
  sourceTypeId: string;
  fileId?: string | null;
  url?: string | null;
  note?: string | null;
  sourceDate?: Date | null;
};

type OpenInput = {
  dataTypeId: string;
  subject: CanonSubject;
  reason: string;
  sources?: CanonSourceInput[];
};

const subjectTypeIdByKind: Record<CanonSubject["kind"], string> = {
  item: canonSubjectTypes.item,
  finishedProduct: canonSubjectTypes.finishedProduct,
  itemSupplier: canonSubjectTypes.itemSupplier,
};

const getOrCreateArtifact = async (db: Db, dataTypeId: string, subject: CanonSubject) => {
  const subjectKey = toSubjectKey(subject);
  const existing = await db.canonArtifact.findUnique({ where: { dataTypeId_subjectKey: { dataTypeId, subjectKey } } });
  if (existing) return existing;

  return db.canonArtifact.create({
    data: { dataTypeId, subjectKey, ...toSubjectColumns(subject), statusId: canonArtifactStatuses.pending },
  });
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Creates the next version from an approved CR, then lets downstream artifacts notice.
const applyChangeRequest = async (db: Db, changeRequestId: string) => {
  const cr = await db.canonChangeRequest.findUniqueOrThrow({
    where: { id: changeRequestId },
    include: { artifact: { include: { dataType: true, currentVersion: true } }, sources: true },
  });
  const { artifact } = cr;

  // someone else's CR landed first; this one was reviewed against content that is no longer current
  if (artifact.currentVersionId !== cr.baseVersionId) {
    await db.canonChangeRequest.update({
      where: { id: cr.id },
      data: { statusId: canonChangeRequestStatuses.outdated, resolvedAt: new Date() },
    });
    await db.canonArtifactEvent.create({
      data: { artifactId: artifact.id, eventTypeId: canonEventTypes.changeRequestOutdated, changeRequestId: cr.id },
    });
    return null;
  }

  const previous = artifact.currentVersion;
  const isConfirmation = cr.kindId === canonChangeRequestKinds.staleConfirmation;

  // a confirmation re-checks lineage, not evidence, so the evidence dates carry over
  const sourceDates = cr.sources.map((s) => s.sourceDate).filter((d): d is Date => !!d);
  const sourceDate = isConfirmation
    ? previous?.sourceDate ?? null
    : sourceDates.length > 0
      ? new Date(Math.max(...sourceDates.map((d) => d.getTime())))
      : new Date();
  const reverifyAt = isConfirmation
    ? previous?.reverifyAt ?? null
    : artifact.dataType.reverifyAfterDays && sourceDate
      ? new Date(sourceDate.getTime() + artifact.dataType.reverifyAfterDays * DAY_MS)
      : null;

  const parents = await getParentArtifacts(db, artifact);
  const upstreamVersionIds = Array.from(
    new Set(parents.map((p) => p.currentVersionId).filter((id): id is string => !!id)),
  );

  const version = await db.canonArtifactVersion.create({
    data: {
      artifactId: artifact.id,
      versionNumber: (previous?.versionNumber ?? 0) + 1,
      changeRequestId: cr.id,
      content: cr.proposedContent as any,
      sourceMarker: cr.proposedMarker ?? previous?.sourceMarker ?? null,
      sourceDate,
      reverifyAt,
      upstream: { create: upstreamVersionIds.map((upstreamVersionId) => ({ upstreamVersionId })) },
    },
  });

  await db.canonArtifact.update({ where: { id: artifact.id }, data: { currentVersionId: version.id } });
  await db.canonChangeRequest.update({
    where: { id: cr.id },
    data: { statusId: canonChangeRequestStatuses.approved, resolvedAt: new Date() },
  });
  await db.canonArtifactEvent.createMany({
    data: [
      { artifactId: artifact.id, eventTypeId: canonEventTypes.changeRequestApproved, changeRequestId: cr.id },
      { artifactId: artifact.id, eventTypeId: canonEventTypes.versionCreated, changeRequestId: cr.id, versionId: version.id },
    ],
  });

  // other open CRs on this artifact were based on the version just replaced
  const superseded = await db.canonChangeRequest.findMany({
    where: { artifactId: artifact.id, statusId: canonChangeRequestStatuses.underReview, id: { not: cr.id } },
    select: { id: true },
  });
  if (superseded.length > 0) {
    await db.canonChangeRequest.updateMany({
      where: { id: { in: superseded.map((s) => s.id) } },
      data: { statusId: canonChangeRequestStatuses.outdated, resolvedAt: new Date() },
    });
    await db.canonArtifactEvent.createMany({
      data: superseded.map((s) => ({
        artifactId: artifact.id,
        eventTypeId: canonEventTypes.changeRequestOutdated,
        changeRequestId: s.id,
      })),
    });
  }

  await refreshArtifactStatus(db, artifact.id);

  // one level only: a child's own version does not change, so grandchildren are unaffected
  for (const child of await getChildArtifacts(db, artifact)) {
    await refreshArtifactStatus(db, child.id, { upstreamArtifactId: artifact.id, upstreamVersionId: version.id });
  }

  return version;
};

// Records a review and resolves the CR if the approval rules are now met.
const recordReview = async (db: Db, changeRequestId: string, reviewerId: string, approved: boolean, comment?: string | null) => {
  await db.canonChangeRequestReview.upsert({
    where: { changeRequestId_reviewerId: { changeRequestId, reviewerId } },
    create: { changeRequestId, reviewerId, approved, comment: comment ?? null },
    update: { approved, comment: comment ?? null },
  });

  const cr = await db.canonChangeRequest.findUniqueOrThrow({
    where: { id: changeRequestId },
    include: { reviews: true, artifact: { include: { dataType: true } } },
  });
  const result = evaluateReviews(cr.artifact.dataType, cr.requestedById, cr.reviews);

  if (result.outcome === "approved") {
    await applyChangeRequest(db, changeRequestId);
  } else if (result.outcome === "rejected") {
    await db.canonChangeRequest.update({
      where: { id: changeRequestId },
      data: { statusId: canonChangeRequestStatuses.rejected, resolvedAt: new Date() },
    });
    await db.canonArtifactEvent.create({
      data: {
        artifactId: cr.artifactId,
        eventTypeId: canonEventTypes.changeRequestRejected,
        changeRequestId,
        userId: result.rejectedBy,
      },
    });
  }
  return result;
};

// Opens a CR. If the requester is also a reviewer, their approval is recorded right away,
// which completes a self-approved owner edit when the type's settings allow it.
const openChangeRequest = async (
  userId: string,
  input: OpenInput & { kindId: string; proposedContent: unknown; proposedMarker?: string | null },
) => {
  const isReviewer = await canUser(userId, input.dataTypeId, canonCapabilities.review);

  return prisma.$transaction(async (tx) => {
    const dataType = await tx.canonDataType.findUniqueOrThrow({ where: { id: input.dataTypeId } });
    if (dataType.subjectTypeId !== subjectTypeIdByKind[input.subject.kind]) {
      throw new Error(`${dataType.name} does not apply to this kind of subject.`);
    }

    const artifact = await getOrCreateArtifact(tx, dataType.id, input.subject);
    const sources = input.sources ?? [];

    // a source acceptance just read the live source, which counts as an observation
    if (input.proposedMarker) {
      await tx.canonArtifact.update({
        where: { id: artifact.id },
        data: { observedMarker: input.proposedMarker, observedAt: new Date() },
      });
    }

    const cr = await tx.canonChangeRequest.create({
      data: {
        artifactId: artifact.id,
        kindId: input.kindId,
        statusId: canonChangeRequestStatuses.underReview,
        requestedById: userId,
        baseVersionId: artifact.currentVersionId,
        proposedContent: input.proposedContent as any,
        proposedMarker: input.proposedMarker ?? null,
        reason: input.reason,
        sources: {
          create: sources.map((s) => ({
            sourceTypeId: s.sourceTypeId,
            fileId: s.fileId ?? null,
            url: s.url ?? null,
            note: s.note ?? null,
            sourceDate: s.sourceDate ?? null,
          })),
        },
      },
    });
    await tx.canonArtifactEvent.create({
      data: { artifactId: artifact.id, eventTypeId: canonEventTypes.changeRequestOpened, changeRequestId: cr.id, userId },
    });

    if (isReviewer) await recordReview(tx, cr.id, userId, true);

    return tx.canonChangeRequest.findUniqueOrThrow({ where: { id: cr.id }, include: { status: true, version: true } });
  });
};

// New content for an authored type.
export const proposeEdit = async (userId: string, input: OpenInput & { proposedContent: unknown }) => {
  const dataType = await prisma.canonDataType.findUniqueOrThrow({ where: { id: input.dataTypeId } });
  if (dataType.resolverKey) throw new Error(`${dataType.name} is linked to Lumexia data; change it at its source.`);
  if (!(await canUser(userId, dataType.id, canonCapabilities.edit))) {
    throw new Error(`You cannot edit ${dataType.name}.`);
  }

  const shapeKey = getShapeKey(dataType.shapeId);
  const content = parseContent(shapeKey, input.proposedContent);
  if (shapeKey === "tagSet") validateTagSet(content as any, dataType.shapeConfig);
  if (dataType.requiresEvidence && (input.sources ?? []).length === 0) {
    throw new Error(`${dataType.name} requires evidence for every change.`);
  }

  return openChangeRequest(userId, { ...input, kindId: canonChangeRequestKinds.edit, proposedContent: content });
};

// Upstream changed but the content is still right: same content, lineage moves forward.
export const confirmStale = async (userId: string, input: { artifactId: string; reason: string }) => {
  const artifact = await prisma.canonArtifact.findUniqueOrThrow({
    where: { id: input.artifactId },
    include: { currentVersion: true },
  });
  if (!artifact.isStale || !artifact.currentVersion) throw new Error("This artifact is not stale.");

  const [canEdit, canReview] = await Promise.all([
    canUser(userId, artifact.dataTypeId, canonCapabilities.edit),
    canUser(userId, artifact.dataTypeId, canonCapabilities.review),
  ]);
  if (!canEdit && !canReview) throw new Error("You cannot confirm this artifact.");

  return openChangeRequest(userId, {
    dataTypeId: artifact.dataTypeId,
    subject: subjectOf(artifact),
    reason: input.reason,
    kindId: canonChangeRequestKinds.staleConfirmation,
    proposedContent: artifact.currentVersion.content,
  });
};

// Linked types: propose the live source value as the new canon. Reviewers own linked types.
export const proposeSourceAcceptance = async (
  userId: string,
  input: { dataTypeId: string; subject: CanonSubject; reason: string },
) => {
  const dataType = await prisma.canonDataType.findUniqueOrThrow({ where: { id: input.dataTypeId } });
  if (!dataType.resolverKey) throw new Error(`${dataType.name} is not linked to a Lumexia source.`);
  if (!(await canUser(userId, dataType.id, canonCapabilities.review))) {
    throw new Error(`You cannot accept changes to ${dataType.name}.`);
  }

  const resolved = await resolveLinked(dataType.resolverKey, input.subject);
  if (!resolved) throw new Error(`There is no source value for ${dataType.name} yet.`);

  return openChangeRequest(userId, {
    ...input,
    kindId: canonChangeRequestKinds.sourceAcceptance,
    proposedContent: resolved.content,
    proposedMarker: resolved.marker,
    sources: [{ sourceTypeId: canonSourceTypes.lumexiaRecord, note: dataType.resolverKey, sourceDate: new Date() }],
  });
};

export const reviewChangeRequest = async (
  userId: string,
  input: { changeRequestId: string; approved: boolean; comment?: string | null },
) => {
  const cr = await prisma.canonChangeRequest.findUniqueOrThrow({
    where: { id: input.changeRequestId },
    include: { artifact: true },
  });
  if (cr.statusId !== canonChangeRequestStatuses.underReview) throw new Error("This change request is closed.");
  if (!(await canUser(userId, cr.artifact.dataTypeId, canonCapabilities.review))) {
    throw new Error("You cannot review this change request.");
  }
  if (!input.approved && !input.comment?.trim()) throw new Error("Rejections need a comment.");

  return prisma.$transaction((tx) => recordReview(tx, cr.id, userId, input.approved, input.comment));
};

export const withdrawChangeRequest = async (userId: string, changeRequestId: string) => {
  const cr = await prisma.canonChangeRequest.findUniqueOrThrow({ where: { id: changeRequestId } });
  if (cr.requestedById !== userId) throw new Error("Only the requester can withdraw a change request.");
  if (cr.statusId !== canonChangeRequestStatuses.underReview) throw new Error("This change request is closed.");

  return prisma.$transaction(async (tx) => {
    await tx.canonChangeRequest.update({
      where: { id: cr.id },
      data: { statusId: canonChangeRequestStatuses.withdrawn, resolvedAt: new Date() },
    });
    await tx.canonArtifactEvent.create({
      data: { artifactId: cr.artifactId, eventTypeId: canonEventTypes.changeRequestWithdrawn, changeRequestId: cr.id, userId },
    });
  });
};
