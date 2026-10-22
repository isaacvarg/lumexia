import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiKeyScopes } from "@/lib/apiKeys";
import type { Db } from "@/lib/canon/db";
import {
  addChangeRequestEvidence,
  confirmStale,
  proposeEdit,
  proposeSourceAcceptance,
  withdrawChangeRequest,
  type CanonSourceInput,
} from "@/lib/canon/changeRequests";
import { canUser, getGranteeIds } from "@/lib/canon/permissions";
import { diffContent, getShapeKey } from "@/lib/canon/shapes";
import { CanonSubject, toSubjectKey } from "@/lib/canon/subjectKey";
import { canonCapabilities } from "@/configs/staticRecords/canonCapabilities";
import { canonChangeRequestStatuses } from "@/configs/staticRecords/canonChangeRequestStatuses";
import { canonSourceTypes } from "@/configs/staticRecords/canonSourceTypes";
import type { McpContext, ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findDataType, findFinishedProduct, findItem, findSupplier } from "../lookups";
import { actingForArg, resolveActor, type Actor } from "../actingFor";
import { runWrite, WriteRefused } from "../writes";
import { contentText } from "./canon";

// Agents propose Canon changes; people decide. Change requests opened here never count the requester's own
// approval, and a shared agent's user must not hold Review at all: these tools have no way to approve or reject.
// The requester is the key's user (e.g. "Canon Agent"); when a delegate key acts for someone, that person is
// recorded as onBehalfOf on the change request's events, so a reviewer sees who directed it.

const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const sourceTypeIdBySnake = Object.fromEntries(Object.entries(canonSourceTypes).map(([key, id]) => [toSnake(key), id]));
const sourceTypeNames = Object.keys(sourceTypeIdBySnake) as [string, ...string[]];

const evidenceArg = z
  .object({
    sourceType: z.enum(sourceTypeNames).describe("Kind of evidence"),
    documentId: z.string().uuid().optional().describe("An item document (documentId from get_item_documents), e.g. the SDS it came from"),
    url: z.string().url().optional(),
    note: z.string().max(4000).optional().describe("What the evidence says or where in the document, e.g. 'SDS section 3'"),
    sourceDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Date of the evidence (YYYY-MM-DD), e.g. the document's issue date; drives re-verification"),
  })
  .refine((e) => e.documentId || e.url || e.note, { message: "Evidence needs a documentId, url or note." });

const subjectArg = z
  .object({
    type: z.enum(["item", "finishedProduct", "itemSupplier"]).describe("What the data type is about (see get_canon_data_types subject)"),
    item: z.string().min(1).describe("Item id or reference code (for finishedProduct: the item it's filled with)"),
    finishedProduct: z.string().optional().describe("finishedProduct only: finished product id or name"),
    supplier: z.string().optional().describe("itemSupplier only: supplier id or name"),
  })
  .describe("The item, finished product, or item + supplier the value belongs to");

const idempotencyKeyArg = z
  .string()
  .min(8)
  .max(200)
  .describe("Unique per intended change, e.g. '<dataType>:<item>:<hash of value>'. Retrying with the same key returns the first result.");

const dryRunArg = z.boolean().optional().describe("Validate and return the diff without creating anything");

const parseRef = (ref: string) => {
  const match = ref.trim().match(/^(?:CR-)?(\d+)$/i);
  return match ? Number(match[1]) : null;
};

const toSources = async (evidence: z.infer<typeof evidenceArg>[]): Promise<CanonSourceInput[] | { error: string }> => {
  const sources: CanonSourceInput[] = [];
  for (const e of evidence) {
    let fileId: string | null = null;
    if (e.documentId) {
      const document = await prisma.itemFile.findUnique({ where: { id: e.documentId }, select: { fileId: true } });
      if (!document) return { error: `No item document with id ${e.documentId}.` };
      fileId = document.fileId;
    }
    sources.push({
      sourceTypeId: sourceTypeIdBySnake[e.sourceType],
      fileId,
      url: e.url ?? null,
      note: e.note ?? null,
      sourceDate: e.sourceDate ? new Date(`${e.sourceDate}T00:00:00Z`) : null,
    });
  }
  return sources;
};

const resolveSubject = async (subject: z.infer<typeof subjectArg>): Promise<{ subject: CanonSubject; label: string } | { error: string }> => {
  const item = await findItem(subject.item);
  if (!item) return { error: `No item found for "${subject.item}". Try search_items.` };

  if (subject.type === "item") return { subject: { kind: "item", itemId: item.id }, label: `${item.name} (${item.referenceCode})` };

  if (subject.type === "itemSupplier") {
    if (!subject.supplier) return { error: "An itemSupplier subject needs supplier." };
    const supplier = await findSupplier(subject.supplier);
    if (!supplier) return { error: `No single supplier matches "${subject.supplier}". Use its id.` };
    return { subject: { kind: "itemSupplier", itemId: item.id, supplierId: supplier.id }, label: `${item.name} from ${supplier.name}` };
  }

  if (!subject.finishedProduct) return { error: "A finishedProduct subject needs finishedProduct." };
  const fp = await findFinishedProduct(subject.finishedProduct, item.id);
  if (!fp) return { error: `No single finished product of ${item.name} matches "${subject.finishedProduct}". Use its id.` };
  return { subject: { kind: "finishedProduct", finishedProductId: fp.id }, label: fp.name };
};

const isDelegateKey = (ctx: McpContext) => ctx.scopes.includes(apiKeyScopes.delegate);

// Recorded on every event an agent causes, so History shows how and for whom.
const eventPayload = (ctx: McpContext, actor: Actor, extra: Record<string, unknown> = {}) => ({
  via: "mcp",
  apiKeyId: ctx.keyId,
  ...(actor.actingFor && {
    onBehalfOf: { userId: actor.user.id, name: actor.user.name, ...actor.actingFor },
  }),
  ...extra,
});

const reviewerNames = async (dataTypeId: string, excludeUserId: string) => {
  const ids = (await getGranteeIds(dataTypeId, canonCapabilities.review)).filter((id) => id !== excludeUserId);
  const users = await prisma.user.findMany({ where: { id: { in: ids }, disabled: false }, select: { name: true } });
  return users.map((u) => u.name);
};

const failure = (error: unknown) => errorResult(error instanceof Error ? error.message : String(error));

export const registerCanonWriteTools: ToolRegistrar = (server, ctx) => {
  const isDelegate = isDelegateKey(ctx);
  const actingForSchema = (isDelegate ? { actingFor: actingForArg } : {}) as unknown as { actingFor: z.ZodOptional<typeof actingForArg> };

  server.registerTool(
    "propose_canon_change",
    {
      title: "Propose canon change",
      description:
        "Open a Canon change request, exactly like the Propose form, for people to review. It never applies on its own. " +
        "kind edit proposes a new value for an authored type (value must match the type's valueFormat from " +
        "get_canon_data_types); stale_confirmation says a stale value is still right after something upstream changed; " +
        "source_acceptance proposes a linked type's current Lumexia value as the canon. Evidence is required when the " +
        "type requiresEvidence. Only one open change request per artifact: if one is open, add evidence to it with " +
        "attach_canon_evidence, or pass supersedeOwnOpen to replace your own. Use dryRun to show the person the diff " +
        "first, and only propose what they agreed to.",
      inputSchema: {
        dataType: z.string().min(1).describe("Data type id or name"),
        subject: subjectArg,
        kind: z.enum(["edit", "stale_confirmation", "source_acceptance"]).default("edit"),
        value: z.unknown().optional().describe("edit only: the new value as JSON in the type's valueFormat"),
        reason: z.string().min(1).max(4000).describe("Why this is the right value, as the person put it"),
        evidence: z.array(evidenceArg).max(20).default([]),
        supersedeOwnOpen: z.boolean().optional().describe("Withdraw your own open change request on this artifact and replace it"),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ dataType: dataTypeArg, subject: subjectInput, kind, value, reason, evidence, supersedeOwnOpen, idempotencyKey, dryRun, actingFor }) => {
      const actor = await resolveActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);

      const dataType = await findDataType(dataTypeArg);
      if (!dataType) return errorResult(`No canon data type "${dataTypeArg}". See get_canon_data_types.`);

      // a shared agent that can review would be one misclick from approving its own proposals
      if (isDelegate && (await canUser(ctx.user.id, dataType.id, canonCapabilities.review))) {
        return errorResult(
          `AGENT_MUST_NOT_REVIEW: ${ctx.user.name} can review ${dataType.name}. Agents may only hold Edit; ` +
            `ask an admin to remove Review for this user in Settings → Canon.`,
        );
      }

      if (kind === "edit" && value === undefined) return errorResult("An edit needs a value.");
      if (kind !== "edit" && value !== undefined) return errorResult(`A ${kind} keeps the current or source value; omit value.`);

      const resolved = await resolveSubject(subjectInput);
      if ("error" in resolved) return errorResult(resolved.error);
      const sources = await toSources(evidence);
      if ("error" in sources) return errorResult(sources.error);

      const subjectKey = toSubjectKey(resolved.subject);
      const shapeKey = getShapeKey(dataType.shapeId);
      const payload = eventPayload(ctx, actor);

      try {
        const outcome = await runWrite(
          ctx,
          { tool: "propose_canon_change", args: { dataType: dataType.id, subjectKey, kind, value, reason, evidence, supersedeOwnOpen, actingFor }, idempotencyKey, dryRun },
          async (db: Db) => {
            const artifact = await db.canonArtifact.findUnique({
              where: { dataTypeId_subjectKey: { dataTypeId: dataType.id, subjectKey } },
              include: {
                currentVersion: { select: { content: true, versionNumber: true } },
                changeRequests: {
                  where: { statusId: canonChangeRequestStatuses.underReview },
                  select: { id: true, referenceCode: true, requestedById: true, requestedBy: { select: { name: true } } },
                },
              },
            });

            for (const open of artifact?.changeRequests ?? []) {
              if (open.requestedById !== ctx.user.id) {
                throw new WriteRefused(
                  `CR-${open.referenceCode} by ${open.requestedBy.name} is already open on this artifact. Add evidence to it ` +
                    `with attach_canon_evidence, or wait until it's resolved.`,
                );
              }
              if (!supersedeOwnOpen) {
                throw new WriteRefused(`Your CR-${open.referenceCode} is already open on this artifact. Pass supersedeOwnOpen to replace it.`);
              }
              await withdrawChangeRequest(ctx.user.id, open.id, { db, eventPayload: { ...payload, reason: "Superseded by a new proposal" } });
            }

            const options = { db, skipSelfApproval: true, eventPayload: payload };
            const input = { dataTypeId: dataType.id, subject: resolved.subject, reason, sources };
            const cr =
              kind === "edit"
                ? await proposeEdit(ctx.user.id, { ...input, proposedContent: value }, options)
                : kind === "source_acceptance"
                  ? await proposeSourceAcceptance(ctx.user.id, input, options)
                  : artifact
                    ? await confirmStale(ctx.user.id, { artifactId: artifact.id, reason, sources }, options)
                    : (() => {
                        throw new WriteRefused(`${dataType.name} has no value for ${resolved.label} yet, so there's nothing to confirm.`);
                      })();

            const full = await db.canonChangeRequest.findUniqueOrThrow({
              where: { id: cr.id },
              select: { referenceCode: true, artifactId: true, proposedContent: true, status: { select: { name: true } } },
            });
            const before = artifact?.currentVersion?.content ?? null;

            return {
              changeRequestRef: `CR-${full.referenceCode}`,
              artifactId: full.artifactId,
              status: full.status.name,
              kind,
              dataType: dataType.name,
              subject: resolved.label,
              currentVersion: artifact?.currentVersion?.versionNumber ?? null,
              currentValue: contentText(dataType.shapeId, before),
              proposedValue: contentText(dataType.shapeId, full.proposedContent),
              diff: diffContent(shapeKey, before, full.proposedContent).filter((line) => line.kind !== "unchanged"),
              requiredApprovals: dataType.requiredApprovals,
              eligibleReviewers: await reviewerNames(dataType.id, ctx.user.id),
              onBehalfOf: actor.actingFor ? actor.user.name : null,
            };
          },
        );

        const { changeRequestRef, ...rest } = outcome.result;
        return jsonResult({
          dryRun: outcome.dryRun,
          ...(outcome.replayed && { replayed: true }),
          // a dry run rolled back, so its number was never kept
          changeRequestRef: outcome.dryRun ? null : changeRequestRef,
          ...rest,
        });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "attach_canon_evidence",
    {
      title: "Attach canon evidence",
      description:
        "Add evidence to a change request that is still under review (anyone's, e.g. a supplier document backing a " +
        "person's proposal). It never changes the proposed value.",
      inputSchema: {
        changeRequestRef: z.string().min(1).describe("e.g. CR-104"),
        evidence: z.array(evidenceArg).min(1).max(20),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ changeRequestRef, evidence, idempotencyKey, dryRun, actingFor }) => {
      const actor = await resolveActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);

      const referenceCode = parseRef(changeRequestRef);
      const cr = referenceCode ? await prisma.canonChangeRequest.findUnique({ where: { referenceCode }, select: { id: true } }) : null;
      if (!cr) return errorResult(`No change request ${changeRequestRef}.`);
      const sources = await toSources(evidence);
      if ("error" in sources) return errorResult(sources.error);

      try {
        const outcome = await runWrite(
          ctx,
          { tool: "attach_canon_evidence", args: { referenceCode, evidence, actingFor }, idempotencyKey, dryRun },
          async (db) => {
            const updated = await addChangeRequestEvidence(ctx.user.id, { changeRequestId: cr.id, sources }, { db, eventPayload: eventPayload(ctx, actor) });
            return {
              changeRequestRef: `CR-${referenceCode}`,
              evidence: updated.sources.map((s) => ({
                type: s.sourceType.name,
                file: s.file?.name ?? null,
                url: s.url,
                note: s.note,
                sourceDate: s.sourceDate,
              })),
            };
          },
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "withdraw_canon_change",
    {
      title: "Withdraw canon change",
      description: "Withdraw an open change request this key's user opened (e.g. the person changed their mind). Others' requests can't be withdrawn.",
      inputSchema: {
        changeRequestRef: z.string().min(1).describe("e.g. CR-104"),
        reason: z.string().min(1).max(2000),
        ...actingForSchema,
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async ({ changeRequestRef, reason, actingFor }) => {
      const actor = await resolveActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);

      const referenceCode = parseRef(changeRequestRef);
      const cr = referenceCode ? await prisma.canonChangeRequest.findUnique({ where: { referenceCode }, select: { id: true } }) : null;
      if (!cr) return errorResult(`No change request ${changeRequestRef}.`);

      try {
        // withdrawing twice is the same request, so the ref itself is the idempotency key
        const outcome = await runWrite(
          ctx,
          { tool: "withdraw_canon_change", args: { referenceCode }, idempotencyKey: `withdraw:CR-${referenceCode}` },
          async (db) => {
            await withdrawChangeRequest(ctx.user.id, cr.id, { db, eventPayload: eventPayload(ctx, actor, { reason }) });
            return { changeRequestRef: `CR-${referenceCode}`, status: "Withdrawn" };
          },
        );
        return jsonResult(outcome.result);
      } catch (error) {
        return failure(error);
      }
    },
  );
};
