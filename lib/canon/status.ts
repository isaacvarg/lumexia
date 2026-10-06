import { CanonArtifact } from "@prisma/client";
import { canonArtifactStatuses } from "@/configs/staticRecords/canonArtifactStatuses";
import { canonDependencyKinds } from "@/configs/staticRecords/canonDependencyKinds";
import { canonEventTypes } from "@/configs/staticRecords/canonEventTypes";
import { Db } from "./db";
import { getParentArtifacts, subjectOf } from "./graph";
import { resolveLinked, stableStringify } from "./resolvers";

// CanonArtifact.statusId is a cache derived from versions, lineage and source markers.
// When several reasons apply, the most severe wins.

type StatusReasons = {
  pending: boolean;
  stale: boolean;
  unreviewedChange: boolean;
  expired: boolean;
  conflict: boolean;
};

const pickStatus = (r: StatusReasons): string => {
  if (r.pending) return canonArtifactStatuses.pending;
  if (r.conflict) return canonArtifactStatuses.conflict;
  if (r.expired) return canonArtifactStatuses.expired;
  if (r.unreviewedChange) return canonArtifactStatuses.unreviewedChange;
  if (r.stale) return canonArtifactStatuses.stale;
  return canonArtifactStatuses.current;
};

export const computeStatusReasons = async (db: Db, artifact: CanonArtifact): Promise<StatusReasons> => {
  const current = artifact.currentVersionId
    ? await db.canonArtifactVersion.findUnique({
        where: { id: artifact.currentVersionId },
        include: { upstream: { select: { upstreamVersionId: true } } },
      })
    : null;

  const parents = await getParentArtifacts(db, artifact);
  const parentVersionIds = new Set(parents.map((p) => p.currentVersionId).filter((id): id is string => !!id));

  // stale when the set of current parent versions differs from what this version was checked against;
  // this also catches a parent that appeared (new BOM material) or disappeared
  const checkedAgainst = new Set(current?.upstream.map((u) => u.upstreamVersionId) ?? []);
  const stale =
    !!current &&
    (parentVersionIds.size !== checkedAgainst.size || Array.from(parentVersionIds).some((id) => !checkedAgainst.has(id)));

  const dataType = await db.canonDataType.findUniqueOrThrow({ where: { id: artifact.dataTypeId } });
  const unreviewedChange =
    !!current && !!dataType.resolverKey && !!artifact.observedMarker && artifact.observedMarker !== current.sourceMarker;

  const expired = !!current?.reverifyAt && current.reverifyAt < new Date();

  // supplier statements that disagree with each other, compared within each data type: statements of
  // this type (when it allows them) and of any type linked "From suppliers"
  const supplierDependencies = await db.canonDataTypeDependency.findMany({
    where: { childId: artifact.dataTypeId, kindId: canonDependencyKinds.suppliers },
    select: { parentId: true },
  });
  const supplierTypeIds = new Set([...supplierDependencies.map((d) => d.parentId), artifact.dataTypeId]);
  const statements = parents.filter((p) => p.supplierId && supplierTypeIds.has(p.dataTypeId) && p.currentVersionId);
  const statementVersions = await db.canonArtifactVersion.findMany({
    where: { id: { in: statements.map((p) => p.currentVersionId!) } },
    select: { id: true, content: true },
  });
  const contentByVersion = new Map(statementVersions.map((v) => [v.id, stableStringify(v.content)]));
  const contentsByType = new Map<string, Set<string>>();
  for (const p of statements) {
    const contents = contentsByType.get(p.dataTypeId) ?? new Set<string>();
    contents.add(contentByVersion.get(p.currentVersionId!) ?? "");
    contentsByType.set(p.dataTypeId, contents);
  }
  const conflict = Array.from(contentsByType.values()).some((contents) => contents.size > 1);

  return { pending: !current, stale, unreviewedChange, expired, conflict };
};

const transitionEvents: { reason: keyof StatusReasons; on: string; off?: string }[] = [
  { reason: "stale", on: canonEventTypes.markedStale },
  { reason: "unreviewedChange", on: canonEventTypes.sourceChanged },
  { reason: "expired", on: canonEventTypes.reverificationExpired },
  { reason: "conflict", on: canonEventTypes.conflictRaised, off: canonEventTypes.conflictResolved },
];

// Recomputes and stores the status, logging an event for each reason that turned on (or off).
export const refreshArtifactStatus = async (db: Db, artifactId: string, payload?: Record<string, unknown>) => {
  const artifact = await db.canonArtifact.findUniqueOrThrow({ where: { id: artifactId } });
  const previous: StatusReasons = {
    pending: !artifact.currentVersionId,
    stale: artifact.isStale,
    unreviewedChange: artifact.hasUnreviewedChange,
    expired: artifact.isExpired,
    conflict: artifact.hasConflict,
  };
  const reasons = await computeStatusReasons(db, artifact);

  for (const { reason, on, off } of transitionEvents) {
    const event = reasons[reason] && !previous[reason] ? on : !reasons[reason] && previous[reason] ? off : undefined;
    if (event) {
      await db.canonArtifactEvent.create({
        data: { artifactId, eventTypeId: event, payload: payload as any },
      });
    }
  }

  const statusId = pickStatus(reasons);
  await db.canonArtifact.update({
    where: { id: artifactId },
    data: {
      statusId,
      isStale: reasons.stale,
      hasUnreviewedChange: reasons.unreviewedChange,
      isExpired: reasons.expired,
      hasConflict: reasons.conflict,
    },
  });
  return statusId;
};

// Linked types: read the live source, remember what was seen, then refresh status.
export const observeLinkedSource = async (db: Db, artifactId: string) => {
  const artifact = await db.canonArtifact.findUniqueOrThrow({
    where: { id: artifactId },
    include: { dataType: { select: { resolverKey: true } } },
  });
  if (!artifact.dataType.resolverKey) return null;

  const resolved = await resolveLinked(artifact.dataType.resolverKey, subjectOf(artifact));
  await db.canonArtifact.update({
    where: { id: artifactId },
    data: { observedMarker: resolved?.marker ?? null, observedAt: new Date() },
  });
  await refreshArtifactStatus(db, artifactId);
  return resolved;
};
