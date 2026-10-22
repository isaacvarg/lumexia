import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { apiKeyScopes } from "@/lib/apiKeys";
import { approveExamination, rejectExamination } from "@/lib/pricing/examinationReview";
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses";
import type { McpContext, ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { actingForArg, resolveActor, type Actor } from "../actingFor";

// Approving and rejecting pricing examinations, and the linked identities that say who is doing it.
// Write keys review as their owner. Delegate keys (a shared agent like Hermes) must say who sent the
// request, and act as the Lumexia user that identity is linked to; they never act as the key's owner.

type Reviewer = Actor;

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
      const reviewer = await resolveActor(ctx, actingFor);
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
      const reviewer = await resolveActor(ctx, actingFor);
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
};
