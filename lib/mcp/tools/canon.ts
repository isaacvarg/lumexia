import { z } from "zod";
import { getArtifactHistory, getItemCanon, getReviewQueue, type CanonEntry } from "@/lib/canon/queries";
import { getShapeKey, toCopyText } from "@/lib/canon/shapes";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";

// Canon content is shape-specific JSON; agents get the same plain text the copy button produces.
const contentText = (shapeId: string, content: unknown) => {
  if (content == null) return null;
  try {
    return toCopyText(getShapeKey(shapeId), content);
  } catch {
    return JSON.stringify(content);
  }
};

const summarizeEntry = (entry: CanonEntry) => {
  const { dataType, artifact } = entry;
  const accepted = contentText(dataType.shapeId, artifact?.currentVersion?.content);
  const live = dataType.resolverKey ? contentText(dataType.shapeId, entry.live) : null;

  return {
    artifactId: artifact?.id ?? null,
    dataType: dataType.name,
    group: dataType.group?.name ?? null,
    shape: dataType.shape.name,
    status: artifact?.status.name ?? "Not started",
    flags: artifact
      ? {
          stale: artifact.isStale,
          unreviewedChange: artifact.hasUnreviewedChange,
          expired: artifact.isExpired,
          conflict: artifact.hasConflict,
        }
      : null,
    version: artifact?.currentVersion?.versionNumber ?? null,
    acceptedValue: accepted,
    // linked types read live from Lumexia; differs from acceptedValue until a reviewer accepts the change
    liveValue: live !== accepted ? live : undefined,
    reverifyAt: artifact?.currentVersion?.reverifyAt ?? null,
    openChangeRequests: artifact?._count.changeRequests ?? 0,
    youCanEdit: entry.canEdit,
    youCanReview: entry.canReview,
  };
};

export const registerCanonTools: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "get_item_canon",
    {
      title: "Get item canon",
      description:
        "Canon (reviewed canonical data) for an item: each applicable data type with its accepted value, status, " +
        "and flags, plus supplier statements, per-supplier facts, and the canon of finished products filled with it. " +
        "acceptedValue is the reviewed truth; liveValue appears when a linked source changed and awaits review.",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);

      const canon = await getItemCanon(ctx.user.id, item.id);

      return jsonResult({
        item,
        entries: canon.item.map((entry) => ({
          ...summarizeEntry(entry),
          supplierStatements: entry.supplierStatements.map((s) => ({
            supplier: s.supplier.name,
            ...summarizeEntry(s.entry),
          })),
        })),
        suppliers: canon.suppliers.map((s) => ({
          supplier: s.supplier.name,
          entries: s.entries.map(summarizeEntry),
        })),
        finishedProducts: canon.finishedProducts.map((fp) => ({
          finishedProduct: fp.finishedProduct.name,
          entries: fp.entries.map(summarizeEntry),
        })),
      });
    },
  );

  server.registerTool(
    "get_canon_history",
    {
      title: "Get canon history",
      description:
        "Full history of one canon artifact (artifactId from get_item_canon): every accepted version with its change " +
        "request, reason, reviews, and evidence, plus open change requests and the event timeline.",
      inputSchema: {
        artifactId: z.string().uuid().describe("Canon artifact id"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ artifactId }) => {
      const history = await getArtifactHistory(artifactId).catch(() => null);
      if (!history) return errorResult(`No canon artifact with id "${artifactId}".`);

      const shapeId = history.dataType.shapeId;
      const describeCr = (cr: (typeof history.changeRequests)[number] | NonNullable<(typeof history.versions)[number]["changeRequest"]>) => ({
        referenceCode: cr.referenceCode,
        kind: cr.kind.name,
        requestedBy: cr.requestedBy.name,
        reason: cr.reason,
        createdAt: cr.createdAt,
        reviews: cr.reviews.map((r) => ({ reviewer: r.reviewer.name, approved: r.approved, comment: r.comment })),
        sources: cr.sources.map((s) => ({
          type: s.sourceType.name,
          file: s.file?.name ?? null,
          url: s.url,
          note: s.note,
          sourceDate: s.sourceDate,
        })),
      });

      return jsonResult({
        artifactId: history.id,
        dataType: history.dataType.name,
        status: history.status.name,
        versions: history.versions.map((v) => ({
          version: v.versionNumber,
          acceptedAt: v.createdAt,
          value: contentText(shapeId, v.content),
          reverifyAt: v.reverifyAt,
          changeRequest: describeCr(v.changeRequest),
          derivedFrom: v.upstream.map((u) => ({
            dataType: u.upstreamVersion.artifact.dataType.name,
            version: u.upstreamVersion.versionNumber,
          })),
        })),
        openChangeRequests: history.changeRequests.map((cr) => ({
          ...describeCr(cr),
          status: cr.status.name,
          proposedValue: contentText(shapeId, cr.proposedContent),
        })),
        events: history.events.map((e) => ({ type: e.eventType.name, by: e.user?.name ?? null, at: e.createdAt })),
      });
    },
  );

  server.registerTool(
    "get_canon_review_queue",
    {
      title: "Get canon review queue",
      description:
        "What the API key's user should act on in Canon: change requests awaiting their review, and artifacts they " +
        "edit or review that are stale, expired, conflicting, or have an unreviewed linked change.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const queue = await getReviewQueue(ctx.user.id);

      type SubjectRow = Pick<(typeof queue.attention)[number], "item" | "supplier" | "finishedProduct">;
      const subject = (a: SubjectRow) => ({
        item: a.item ?? a.finishedProduct?.filledWithItem ?? null,
        supplier: a.supplier?.name ?? null,
        finishedProduct: a.finishedProduct?.name ?? null,
      });

      return jsonResult({
        awaitingYourReview: queue.changeRequests.map((cr) => ({
          referenceCode: cr.referenceCode,
          artifactId: cr.artifactId,
          dataType: cr.artifact.dataType.name,
          kind: cr.kind.name,
          requestedBy: cr.requestedBy.name,
          reason: cr.reason,
          createdAt: cr.createdAt,
          ...subject(cr.artifact),
        })),
        needsAttention: queue.attention.map((a) => ({
          artifactId: a.id,
          dataType: a.dataType.name,
          status: a.status.name,
          stale: a.isStale,
          unreviewedChange: a.hasUnreviewedChange,
          expired: a.isExpired,
          conflict: a.hasConflict,
          ...subject(a),
        })),
      });
    },
  );
};
