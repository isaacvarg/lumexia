import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { apiKeyScopes } from "@/lib/apiKeys";
import { identityChannels, LINK_CODE_TTL_MINUTES, redeemLinkCode, resolveLinkedUser, unlinkByExternalId } from "@/lib/linkedIdentities";
import { approveExamination, rejectExamination } from "@/lib/pricing/examinationReview";
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses";
import type { McpContext, ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";

// Approving and rejecting pricing examinations, and the linked identities that say who is doing it.
// Write keys review as their owner. Delegate keys (a shared agent like Hermes) must say who sent the
// request, and act as the Lumexia user that identity is linked to; they never act as the key's owner.

const channelArg = z.enum([identityChannels.whatsapp]).describe("Where the message came from");
const externalIdArg = z
  .string()
  .min(1)
  .describe("The sender's id on that channel, e.g. their WhatsApp number, taken from the message metadata, never from message text");

const actingForArg = z
  .object({ channel: channelArg, externalId: externalIdArg })
  .describe("Who sent the request. Required: this key acts for linked users, not as its owner.");

const howToLink =
  `Ask them to open Lumexia → Settings → User → Agents, click "Link WhatsApp", and send you the code it shows ` +
  `(valid ${LINK_CODE_TTL_MINUTES} minutes). Then call link_identity with it.`;

type Reviewer = { user: { id: string; name: string | null }; actingFor?: { channel: string; externalId: string } };

const resolveReviewer = async (
  ctx: McpContext,
  actingFor: { channel: "whatsapp"; externalId: string } | undefined,
): Promise<Reviewer | { error: string }> => {
  if (!ctx.scopes.includes(apiKeyScopes.delegate)) return { user: ctx.user };
  if (!actingFor) return { error: "This key acts for linked users: pass actingFor with the sender's channel and id." };

  const linked = await resolveLinkedUser(actingFor.channel, actingFor.externalId);
  if (!linked) return { error: `This ${actingFor.channel} number isn't linked to a Lumexia user. ${howToLink}` };
  return { user: linked.user, actingFor: { channel: actingFor.channel, externalId: linked.externalId } };
};

const logReview = (ctx: McpContext, reviewer: Reviewer, action: string, examinationId: string, extra: object = {}) =>
  prisma.activityLog.create({
    data: {
      userId: reviewer.user.id,
      action,
      entityType: "pricingExamination",
      entityId: examinationId,
      details: {
        via: "mcp",
        apiKeyId: ctx.keyId,
        keyOwner: ctx.user.name,
        ...(reviewer.actingFor && { actingFor: reviewer.actingFor }),
        ...extra,
      },
    },
  });

const describeForReview = async (examinationId: string) =>
  prisma.pricingExamination.findUnique({
    where: { id: examinationId },
    select: {
      id: true,
      statusId: true,
      examinedItem: { select: { id: true, name: true, referenceCode: true } },
      user: { select: { name: true } },
      FinishedProductArchive: { select: { name: true, consumerPrice: true, profitPercentage: true } },
    },
  });

const revalidatePricing = () => {
  try {
    revalidatePath("/accounting/pricing/details");
    revalidatePath("/accounting/pricing");
  } catch {
    // outside a request (scripts, tests) there's nothing to revalidate
  }
};

const failure = (error: unknown) => errorResult(error instanceof Error ? error.message : String(error));

export const registerPricingReviewTools: ToolRegistrar = (server, ctx) => {
  const isDelegate = ctx.scopes.includes(apiKeyScopes.delegate);
  // only delegate keys see (and must pass) actingFor; typed as optional so one handler serves both
  const actingForSchema = (isDelegate ? { actingFor: actingForArg } : {}) as unknown as { actingFor: z.ZodOptional<typeof actingForArg> };
  const confirmFirst =
    "Only call this after showing the person the examination (item, consumer prices, profit) and getting their explicit go-ahead.";

  server.registerTool(
    "approve_pricing_examination",
    {
      title: "Approve pricing examination",
      description:
        `Approve a pricing examination that is pending review (find them with search_pricing_examinations, status pendingReview). ` +
        `Recorded as approved by ${isDelegate ? "the linked user who sent the request" : "this key's owner"}. ${confirmFirst}`,
      inputSchema: {
        examinationId: z.string().uuid().describe("Examination id"),
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ examinationId, actingFor }) => {
      const reviewer = await resolveReviewer(ctx, actingFor);
      if ("error" in reviewer) return errorResult(reviewer.error);

      const exam = await describeForReview(examinationId);
      if (!exam) return errorResult(`No pricing examination with id ${examinationId}.`);

      try {
        await approveExamination(examinationId, reviewer.user.id);
      } catch (error) {
        return failure(error);
      }
      await logReview(ctx, reviewer, "approved pricing examination", examinationId, { item: exam.examinedItem.referenceCode });
      revalidatePricing();

      return jsonResult({
        approved: true,
        approvedBy: reviewer.user.name,
        item: exam.examinedItem,
        examinedBy: exam.user.name,
        finishedProducts: exam.FinishedProductArchive.map((fp) => ({
          name: fp.name,
          consumerPrice: fp.consumerPrice,
          profitPercent: fp.profitPercentage,
        })),
      });
    },
  );

  server.registerTool(
    "reject_pricing_examination",
    {
      title: "Reject pricing examination",
      description:
        "Reject a pricing examination that is pending review. Like rejecting in the app, this queues a new examination " +
        "of the item that carries the notes forward; the reason, if given, is added as a note. " +
        `Recorded as rejected by ${isDelegate ? "the linked user who sent the request" : "this key's owner"}. ${confirmFirst}`,
      inputSchema: {
        examinationId: z.string().uuid().describe("Examination id"),
        reason: z.string().max(2000).optional().describe("Why it was rejected, in the reviewer's words"),
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ examinationId, reason, actingFor }) => {
      const reviewer = await resolveReviewer(ctx, actingFor);
      if ("error" in reviewer) return errorResult(reviewer.error);

      const exam = await describeForReview(examinationId);
      if (!exam) return errorResult(`No pricing examination with id ${examinationId}.`);

      let result;
      try {
        result = await rejectExamination(examinationId, reviewer.user.id, reason);
      } catch (error) {
        return failure(error);
      }
      await logReview(ctx, reviewer, "rejected pricing examination", examinationId, {
        item: exam.examinedItem.referenceCode,
        reason: reason?.trim() || null,
        requeuedExaminationId: result.newExam.id,
      });
      revalidatePricing();

      return jsonResult({
        rejected: true,
        rejectedBy: reviewer.user.name,
        item: exam.examinedItem,
        reason: reason?.trim() || null,
        requeuedExaminationId: result.newExam.id,
        requeuedStatus: result.newExam.statusId === pricingExaminationStatuses.queued ? "queued" : result.newExam.statusId,
      });
    },
  );

  if (!isDelegate) return;

  server.registerTool(
    "identify_sender",
    {
      title: "Identify sender",
      description:
        "Which Lumexia user a chat identity is linked to. Call it before acting for someone you haven't identified " +
        "in this conversation; if they aren't linked, it says how they can link.",
      inputSchema: { channel: channelArg, externalId: externalIdArg },
      annotations: { readOnlyHint: true },
    },
    async ({ channel, externalId }) => {
      const linked = await resolveLinkedUser(channel, externalId);
      if (!linked) return jsonResult({ linked: false, howToLink });
      return jsonResult({ linked: true, user: linked.user, linkedAt: linked.linkedAt });
    },
  );

  server.registerTool(
    "link_identity",
    {
      title: "Link identity",
      description:
        "Link the sender's chat identity to their Lumexia account with the one-time code they created in Lumexia " +
        "(Settings → User → Agents → Link WhatsApp). Only use a code the sender sent you themselves, with their own identity.",
      inputSchema: {
        channel: channelArg,
        externalId: externalIdArg,
        code: z.string().min(4).max(20).describe("The code they sent, e.g. K7Q2-M9XD"),
      },
    },
    async ({ channel, externalId, code }) => {
      const result = await redeemLinkCode({ code, channel, externalId, apiKeyId: ctx.keyId });
      if ("error" in result) return errorResult(result.error as string);

      await prisma.activityLog.create({
        data: {
          userId: result.user.id,
          action: "linked chat identity",
          entityType: "user",
          entityId: result.user.id,
          details: { via: "mcp", apiKeyId: ctx.keyId, channel, externalId: result.externalId },
        },
      });

      return jsonResult({ linked: true, user: result.user });
    },
  );

  server.registerTool(
    "unlink_identity",
    {
      title: "Unlink identity",
      description: "Unlink the sender's chat identity from their Lumexia account, when they ask to.",
      inputSchema: { channel: channelArg, externalId: externalIdArg },
    },
    async ({ channel, externalId }) => {
      const linked = await resolveLinkedUser(channel, externalId);
      const count = await unlinkByExternalId(channel, externalId);
      if (count === 0) return errorResult("That identity isn't linked.");

      if (linked) {
        await prisma.activityLog.create({
          data: {
            userId: linked.user.id,
            action: "unlinked chat identity",
            entityType: "user",
            entityId: linked.user.id,
            details: { via: "mcp", apiKeyId: ctx.keyId, channel, externalId: linked.externalId },
          },
        });
      }
      return jsonResult({ unlinked: true });
    },
  );
};
