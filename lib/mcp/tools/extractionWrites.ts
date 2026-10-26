import { z } from "zod";
import { CatalogRefused, createFactDefinition } from "@/lib/documentExtractions/catalog";
import { documentContent } from "@/lib/documentExtractions/content";
import {
  ExtractionRefused,
  markExtractionFailed,
  storeExtraction,
  updateExtractionFacts,
  type ExtractionActor,
} from "@/lib/documentExtractions/store";
import { agentFactMethods, factConfidences, factKinds, factScopes, valueTypes } from "@/lib/documentExtractions/types";
import { unitFamilies } from "@/lib/documentExtractions/units";
import { apiKeyScopes } from "@/lib/apiKeys";
import type { McpContext, ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { actingForArg, resolveActor } from "../actingFor";
import { runWrite, WriteRefused } from "../writes";

// Writing document extractions (keys with extract:write). The agent stores what a document says and
// corrects its own reading; it never verifies. Facts people wrote or verified are theirs: changing a
// verified fact resets its check, and facts with method human can't be touched at all.

const idempotencyKeyArg = z.string().min(8).max(200).describe("Unique per intended change; retrying with the same key returns the first result");
const dryRunArg = z.boolean().optional().describe("Validate and return the result without changing anything");
const sha256Arg = z
  .string()
  .regex(/^[a-fA-F0-9]{64}$/)
  .transform((s) => s.toLowerCase())
  .describe("sha256 of the file you read (`sha256sum`); must match the document's file");

const factArg = z.object({
  key: z.string().min(1).describe("A key from list_fact_definitions (or one you created)"),
  scope: z.enum(factScopes).optional().describe("material (default) or component"),
  component: z
    .object({ name: z.string().optional().describe("Chemical name, never a trade name"), cas: z.string().optional() })
    .optional()
    .describe("For component facts"),
  value: z.unknown().describe("Shaped by the key's kind and valueSchema; see list_fact_definitions"),
  printed: z.string().max(2000).optional().describe("The value exactly as printed, e.g. '93 °C (199 °F) closed cup'"),
  unit: z.string().max(50).optional().describe("Unit as printed, for numbers"),
  rowIndex: z.number().int().min(0).optional().describe("Order of this row within its key"),
  page: z
    .object({
      index: z.number().int().min(0).optional().describe("0-based PDF page, checked against the PDF"),
      label: z.string().max(50).optional().describe("The sheet's own printed page number, e.g. '3 of 9'"),
    })
    .optional(),
  quote: z.string().min(1).max(4000).describe("The exact text the fact comes from"),
  method: z.enum(agentFactMethods).describe("text_layer first; vision (page images) when text is missing or sparse; ocr last"),
  confidence: z.enum(factConfidences),
  needsHumanCheck: z.boolean().optional().describe("Ask for a person's check; forced for vision/ocr on safety-relevant keys"),
});

const columnArg = z.object({
  name: z.string(),
  type: z.enum([...valueTypes, "enum", "list"]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const failure = (error: unknown) => {
  if (error instanceof ExtractionRefused || error instanceof CatalogRefused) {
    return errorResult(error.details ? `${error.message}\n${JSON.stringify(error.details)}` : error.message);
  }
  if (error instanceof WriteRefused) return errorResult(error.message);
  return errorResult(error instanceof Error ? error.message : String(error));
};

// The agent is always the actor; a delegate key may say who it's working for.
const extractionActor = async (ctx: McpContext, actingFor: unknown): Promise<ExtractionActor | { error: string }> => {
  if (!actingFor) return { userId: ctx.user.id, apiKeyId: ctx.keyId };
  const actor = await resolveActor(ctx, actingFor as Parameters<typeof resolveActor>[1]);
  if ("error" in actor) return { error: actor.error };
  return { userId: ctx.user.id, apiKeyId: ctx.keyId, onBehalfOfId: actor.actingFor ? actor.user.id : null };
};

// The document must exist and its file must be the content the agent read.
const checkContent = async (documentId: string, sha256: string) => {
  const found = await documentContent(documentId).catch((error: Error) => ({ error: `Couldn't read the document's file to hash it: ${error.message}` }));
  if (!found) return { error: `No item document ${documentId}. Use get_item_documents.` };
  if ("error" in found) return found;
  if (found.sha256 !== sha256) {
    return {
      error:
        `The document's file has sha256 ${found.sha256}, not ${sha256}: you read a different file than the one filed. ` +
        "Download it again with get_document_downloads.",
    };
  }
  return { document: found.document };
};

export const registerExtractionWriteTools: ToolRegistrar = (server, ctx) => {
  const isDelegate = ctx.scopes.includes(apiKeyScopes.delegate);
  const actingForSchema = (isDelegate ? { actingFor: actingForArg.optional().describe("Who you're working for, if anyone") } : {}) as unknown as {
    actingFor: z.ZodOptional<typeof actingForArg>;
  };

  server.registerTool(
    "create_fact_definition",
    {
      title: "Create fact definition",
      description:
        "Add a key to the fact catalog for something documents state that no existing key covers. It's usable at once as " +
        "proposed, treated as safety-relevant until a person reviews it, and people may merge it into another key later. " +
        "Keys that look like existing ones are refused with the candidates: use one of them, or pass confirmNew with a " +
        "reason saying why none fits. Value shapes: scalar {type: text|number|date|boolean|cas}; enum {options}; " +
        "claim {} (value {status: stated|negated|not_stated}); row {columns: [{name, type, required?, options?}], " +
        "normalize?: {min, max?}, defaultUnit?}; section {} (value {present, empty}).",
      inputSchema: {
        key: z.string().min(2).max(63).describe("lower_snake_case, e.g. nanomaterial_free"),
        label: z.string().min(1).max(200),
        description: z.string().min(1).max(1000).describe("What the fact means and how to read it from a document"),
        kind: z.enum(factKinds),
        valueSchema: z
          .object({
            type: z.enum(valueTypes).optional(),
            options: z.array(z.string()).optional(),
            columns: z.array(columnArg).optional(),
            normalize: z.object({ min: z.string(), max: z.string().optional() }).optional(),
            defaultUnit: z.string().optional(),
          })
          .optional(),
        unitFamily: z.enum(unitFamilies as [string, ...string[]]).optional().describe("For numbers converted for search"),
        documentTypes: z.array(z.string()).optional().describe("Document types it applies to (id, name or abbreviation)"),
        confirmNew: z.boolean().optional().describe("Create it even though similar keys exist"),
        reason: z.string().max(1000).optional().describe("Why none of the similar keys fits (needed with confirmNew)"),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ idempotencyKey, dryRun, actingFor, ...input }) => {
      const actor = await extractionActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      try {
        const outcome = await runWrite(ctx, { tool: "create_fact_definition", args: { ...input, actingFor }, idempotencyKey, dryRun }, (db) =>
          createFactDefinition(db, actor, input),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "store_document_extraction",
    {
      title: "Store document extraction",
      description:
        "Store what a document says as facts. Read the text layer first (`pdftotext -layout`); read page images (vision) " +
        "only where text is missing or too sparse, and OCR last. One fact per table row (rowIndex keeps order). Every fact " +
        "needs the exact quote and its page (the 0-based PDF index, checked against the PDF, plus the printed page label). " +
        "Component facts name a chemical with its CAS, never a trade name. A claim the document doesn't make is not_stated, " +
        "never negated. Record contradictions in notes (SDS section 2 wins for classification; sections 1 and 3 win for " +
        "CAS) instead of resolving them. sha256 must be the document's file. If the content already has a current " +
        "extraction, pass supersedeExisting to replace it: checks people made carry over to identical facts, and verified " +
        "facts that changed or disappeared come back as conflicts. Run with dryRun first to see warnings.",
      inputSchema: {
        documentId: z.string().describe("Item document id"),
        sha256: sha256Arg,
        extractor: z.object({
          name: z.string().min(1).max(200).describe("Tool or skill that read the document"),
          version: z.string().max(100).optional(),
          model: z.string().max(200).optional().describe("Model that read it"),
        }),
        pageCount: z.number().int().min(1).optional(),
        language: z.string().max(20).optional().describe("e.g. en"),
        fullText: z.string().max(2_000_000).optional().describe("The document's text layer, kept apart and only returned on request"),
        facts: z.array(factArg).max(2000),
        notes: z.string().max(10_000).optional().describe("Caveats and supplier contradictions"),
        supersedeExisting: z.boolean().optional().describe("Replace the current extraction of this content"),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ documentId, idempotencyKey, dryRun, actingFor, ...input }) => {
      const actor = await extractionActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      const content = await checkContent(documentId, input.sha256);
      if ("error" in content) return errorResult(content.error as string);
      try {
        const outcome = await runWrite(
          ctx,
          { tool: "store_document_extraction", args: { documentId, ...input, actingFor }, idempotencyKey, dryRun },
          (db) => storeExtraction(db, actor, input as Parameters<typeof storeExtraction>[2]),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), documentId, ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "update_extraction_facts",
    {
      title: "Update extraction facts",
      description:
        "Correct the current extraction: add facts (upsert without factId), change facts (with factId) and remove facts. " +
        "Changing or removing a fact a person verified resets their check, and is reported. Facts people wrote (method " +
        "human) can't be changed. Give the reason for the correction.",
      inputSchema: {
        extractionId: z.string(),
        upsert: z.array(factArg.extend({ factId: z.string().optional().describe("The fact to change; omit to add") })).max(500).default([]),
        remove: z.array(z.string()).max(500).default([]).describe("Fact ids to remove"),
        reason: z.string().min(3).max(1000),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async ({ idempotencyKey, dryRun, actingFor, ...input }) => {
      if (!input.upsert.length && !input.remove.length) return errorResult("Nothing to change: pass upsert or remove.");
      const actor = await extractionActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      try {
        const outcome = await runWrite(ctx, { tool: "update_extraction_facts", args: { ...input, actingFor }, idempotencyKey, dryRun }, (db) =>
          updateExtractionFacts(db, actor, input as Parameters<typeof updateExtractionFacts>[2]),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "mark_extraction_failed",
    {
      title: "Mark extraction failed",
      description:
        "Record that a document can't be read (password-protected, blank scan, corrupt…), so audits stop retrying it. " +
        "Storing an extraction for the same file later replaces the failure.",
      inputSchema: {
        documentId: z.string().describe("Item document id"),
        sha256: sha256Arg,
        reason: z.string().min(3).max(1000),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ documentId, sha256, reason, idempotencyKey, dryRun, actingFor }) => {
      const actor = await extractionActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      const content = await checkContent(documentId, sha256);
      if ("error" in content) return errorResult(content.error as string);
      try {
        const outcome = await runWrite(ctx, { tool: "mark_extraction_failed", args: { documentId, sha256, reason, actingFor }, idempotencyKey, dryRun }, (db) =>
          markExtractionFailed(db, actor, { sha256, reason }),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), documentId, ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );
};
