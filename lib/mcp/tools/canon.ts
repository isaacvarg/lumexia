import { z } from "zod";
import prisma from "@/lib/prisma";
import { getArtifactHistory, getItemCanon, getReviewQueue, type CanonEntry } from "@/lib/canon/queries";
import { getShapeKey, toCopyText, type CanonShapeKey } from "@/lib/canon/shapes";
import { canonArtifactStatuses } from "@/configs/staticRecords/canonArtifactStatuses";
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities";
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { getResolver } from "@/lib/canon/resolvers";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findDataType, findItem } from "../lookups";
import { describeItemDocuments } from "./documents";

// Canon content is shape-specific JSON; agents get the same plain text the copy button produces.
export const contentText = (shapeId: string, content: unknown) => {
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

// The JSON value each shape takes in propose_canon_change, so agents can build valid values.
export const shapeFormats: Record<CanonShapeKey, unknown> = {
  text: { text: "Plain text" },
  richText: { html: "<p>Formatted text</p>", plain: "Formatted text" },
  boolean: { value: true },
  orderedList: { items: ["First", "Second"] },
  tagSet: { tags: ["one of shapeConfig.options"] },
  blockList: { blocks: [{ title: "Heading", body: "Text" }] },
  keyValue: { rows: [{ key: "Key", value: "Value" }] },
  composition: { rows: [{ inci: "Aqua", cas: "7732-18-5", percentMin: 60, percentMax: 70 }] },
  billOfMaterials: {
    rows: [{ identifier: "A1", itemId: "<item id>", itemName: "Name", concentration: 12.5, stepSequence: 1, phase: null }],
  },
};

const statusKeys = Object.keys(canonArtifactStatuses) as [keyof typeof canonArtifactStatuses, ...(keyof typeof canonArtifactStatuses)[]];

const subjectOfArtifact = (a: {
  item: { id: string; name: string; referenceCode: string } | null;
  supplier: { id: string; name: string } | null;
  finishedProduct: { id: string; name: string } | null;
}) => ({
  item: a.item,
  supplier: a.supplier,
  finishedProduct: a.finishedProduct,
});

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

  server.registerTool(
    "get_canon_data_types",
    {
      title: "Get canon data types",
      description:
        "Every active Canon data type and how it is set up: group, shape (with the JSON value format to propose), " +
        "subject, whether it is authored or linked to a Lumexia source, what it applies to, dependencies, approval " +
        "rules, whether changes need evidence, re-verification period, website key, and who can edit and review it.",
      inputSchema: {
        group: z.string().optional().describe("Only types in this group (name)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ group }) => {
      const dataTypes = await prisma.canonDataType.findMany({
        where: {
          recordStatusId: recordStatuses.active,
          ...(group && { group: { name: { equals: group, mode: "insensitive" } } }),
        },
        include: {
          group: true,
          shape: true,
          subjectType: true,
          procurementType: { select: { name: true } },
          itemTypes: { select: { itemType: { select: { name: true } } } },
          parents: { select: { parent: { select: { name: true } }, kind: { select: { name: true } } } },
          userPermissions: { select: { capabilityId: true, user: { select: { id: true, name: true } } } },
          teamPermissions: {
            select: {
              capabilityId: true,
              team: { select: { name: true, members: { select: { userId: true } } } },
            },
          },
        },
        orderBy: [{ group: { sequence: "asc" } }, { name: "asc" }],
      });

      return jsonResult(
        dataTypes.map((d) => {
          const shapeKey = getShapeKey(d.shapeId);
          const holders = (capabilityId: string) => ({
            users: d.userPermissions.filter((p) => p.capabilityId === capabilityId).map((p) => p.user.name),
            teams: d.teamPermissions.filter((p) => p.capabilityId === capabilityId).map((p) => p.team.name),
          });
          const has = (capabilityId: string) =>
            d.userPermissions.some((p) => p.capabilityId === capabilityId && p.user.id === ctx.user.id) ||
            d.teamPermissions.some((p) => p.capabilityId === capabilityId && p.team.members.some((m) => m.userId === ctx.user.id));
          let source: { kind: "authored" } | { kind: "linked"; resolver: string; label: string };
          try {
            source = d.resolverKey ? { kind: "linked", resolver: d.resolverKey, label: getResolver(d.resolverKey).label } : { kind: "authored" };
          } catch {
            source = { kind: "linked", resolver: d.resolverKey!, label: d.resolverKey! };
          }

          return {
            id: d.id,
            name: d.name,
            description: d.description,
            group: d.group?.name ?? null,
            shape: shapeKey,
            valueFormat: shapeFormats[shapeKey],
            shapeConfig: d.shapeConfig,
            subject: d.subjectType.name,
            allowSupplierStatements: d.allowSupplierStatements,
            source,
            appliesTo: {
              itemTypes: d.itemTypes.length ? d.itemTypes.map((t) => t.itemType.name) : "all",
              procurementType: d.procurementType?.name ?? "all",
            },
            dependsOn: d.parents.map((p) => ({ dataType: p.parent.name, via: p.kind.name })),
            requiredApprovals: d.requiredApprovals,
            requiresDifferentReviewer: d.requiresDifferentReviewer,
            requiresEvidence: d.requiresEvidence,
            reverifyAfterDays: d.reverifyAfterDays,
            externalKey: d.externalKey,
            editors: holders(canonCapabilities.edit),
            reviewers: holders(canonCapabilities.review),
            youCanEdit: has(canonCapabilities.edit),
            youCanReview: has(canonCapabilities.review),
          };
        }),
      );
    },
  );

  server.registerTool(
    "search_canon_artifacts",
    {
      title: "Search canon artifacts",
      description:
        "Find canon artifacts across items for sweeps: filter by data type, group, status, flags, or item. An artifact " +
        "exists once someone proposed a value for that data type and subject, so a type with no artifact for an item " +
        "has never been filled in (see get_item_canon for one item's gaps).",
      inputSchema: {
        dataType: z.string().optional().describe("Data type id or name"),
        group: z.string().optional().describe("Data type group name"),
        status: z.enum(statusKeys).optional().describe("Displayed status"),
        stale: z.boolean().optional(),
        unreviewedChange: z.boolean().optional().describe("Linked types whose source changed and awaits acceptance"),
        expired: z.boolean().optional(),
        conflict: z.boolean().optional(),
        hasOpenChangeRequest: z.boolean().optional(),
        item: z.string().optional().describe("Item id or reference code"),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      const dataType = args.dataType ? await findDataType(args.dataType) : null;
      if (args.dataType && !dataType) return errorResult(`No canon data type "${args.dataType}". See get_canon_data_types.`);
      const item = args.item ? await findItem(args.item) : null;
      if (args.item && !item) return errorResult(`No item found for "${args.item}". Try search_items.`);

      const openCr = { some: { statusId: canonChangeRequestStatuses.underReview } };
      const where = {
        ...(dataType && { dataTypeId: dataType.id }),
        ...(args.group && { dataType: { group: { name: { equals: args.group, mode: "insensitive" as const } } } }),
        ...(args.status && { statusId: canonArtifactStatuses[args.status] }),
        ...(args.stale !== undefined && { isStale: args.stale }),
        ...(args.unreviewedChange !== undefined && { hasUnreviewedChange: args.unreviewedChange }),
        ...(args.expired !== undefined && { isExpired: args.expired }),
        ...(args.conflict !== undefined && { hasConflict: args.conflict }),
        ...(args.hasOpenChangeRequest !== undefined && { changeRequests: args.hasOpenChangeRequest ? openCr : { none: { statusId: canonChangeRequestStatuses.underReview } } }),
        ...(item && { OR: [{ itemId: item.id }, { finishedProduct: { filledWithItemId: item.id } }] }),
      };

      const [total, artifacts] = await Promise.all([
        prisma.canonArtifact.count({ where }),
        prisma.canonArtifact.findMany({
          where,
          include: {
            dataType: { select: { name: true, shapeId: true, group: { select: { name: true } } } },
            status: { select: { name: true } },
            currentVersion: { select: { versionNumber: true, content: true, reverifyAt: true } },
            item: { select: { id: true, name: true, referenceCode: true } },
            supplier: { select: { id: true, name: true } },
            finishedProduct: { select: { id: true, name: true } },
            changeRequests: {
              where: { statusId: canonChangeRequestStatuses.underReview },
              select: { referenceCode: true, kind: { select: { name: true } }, requestedBy: { select: { name: true } } },
            },
          },
          orderBy: [{ updatedAt: "desc" }],
          skip: args.offset,
          take: args.limit,
        }),
      ]);

      return jsonResult({
        total,
        offset: args.offset,
        artifacts: artifacts.map((a) => ({
          artifactId: a.id,
          dataType: a.dataType.name,
          group: a.dataType.group?.name ?? null,
          ...subjectOfArtifact(a),
          status: a.status.name,
          flags: { stale: a.isStale, unreviewedChange: a.hasUnreviewedChange, expired: a.isExpired, conflict: a.hasConflict },
          version: a.currentVersion?.versionNumber ?? null,
          acceptedValue: contentText(a.dataType.shapeId, a.currentVersion?.content),
          reverifyAt: a.currentVersion?.reverifyAt ?? null,
          openChangeRequests: a.changeRequests.map((cr) => ({
            ref: `CR-${cr.referenceCode}`,
            kind: cr.kind.name,
            requestedBy: cr.requestedBy.name,
          })),
        })),
      });
    },
  );

  server.registerTool(
    "get_item_bom",
    {
      title: "Get item BOM",
      description:
        "The bill of materials of an item's active MBPR: each material with its id, reference code, concentration (%), " +
        "step and phase.",
      inputSchema: { item: z.string().min(1).describe("Item id or reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);
      const bom = await getActiveBom(item.id);
      if (!bom) return errorResult(`${item.name} has no active MBPR.`);
      return jsonResult({ item, ...bom });
    },
  );

  server.registerTool(
    "get_material_documents_for_bom",
    {
      title: "Get material documents for BOM",
      description:
        "Documents (SDS, COA, IFRA…) for every material in an item's active BOM in one call: what each material has on " +
        "file and what its requirements expect. Use get_document_downloads with the documentIds to read files.",
      inputSchema: { item: z.string().min(1).describe("Item id or reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);
      const bom = await getActiveBom(item.id);
      if (!bom) return errorResult(`${item.name} has no active MBPR.`);

      const materialIds = Array.from(new Set(bom.materials.map((m) => m.item.id)));
      const documents = await Promise.all(materialIds.map((id) => describeItemDocuments(id)));
      const byId = new Map(materialIds.map((id, i) => [id, documents[i]]));

      return jsonResult({
        item,
        mbprVersion: bom.mbprVersion,
        materials: materialIds.map((id) => {
          const material = bom.materials.find((m) => m.item.id === id)!;
          return { material: material.item, concentration: material.concentration, ...byId.get(id) };
        }),
      });
    },
  );
};

const getActiveBom = async (itemId: string) => {
  const mbpr = await prisma.masterBatchProductionRecord.findFirst({
    where: { producesItemId: itemId, recordStatusId: recordStatuses.active },
    select: {
      id: true,
      versionLabel: true,
      BillOfMaterial: {
        where: { recordStatusId: recordStatuses.active },
        select: {
          identifier: true,
          concentration: true,
          item: { select: { id: true, name: true, referenceCode: true } },
          step: { select: { sequence: true, phase: true } },
        },
        orderBy: { identifier: "asc" },
      },
    },
  });
  if (!mbpr) return null;

  const materials = mbpr.BillOfMaterial.map((line) => ({
    identifier: line.identifier,
    item: line.item,
    concentration: line.concentration,
    step: line.step.sequence,
    phase: line.step.phase ?? null,
  }));
  return {
    mbprId: mbpr.id,
    mbprVersion: mbpr.versionLabel,
    totalConcentration: Math.round(materials.reduce((sum, m) => sum + m.concentration, 0) * 1000) / 1000,
    materials,
  };
};
