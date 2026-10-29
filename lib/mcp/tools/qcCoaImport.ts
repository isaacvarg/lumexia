import { z } from "zod";
import prisma from "@/lib/prisma";
import { CoaImportRefused, importLotCoaResults, undoCoaImport } from "@/lib/qcCoaImport/importCoa";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";
import { runWrite, WriteRefused } from "../writes";

// Supplier COAs into lot quality results (keys with extract:write for the writes). The agent reads the COA
// into test_result facts first (store_document_extraction), then imports; Lumexia does the matching, the
// limits, the pass/fail and the review flags, so every agent gets the same behaviour. Agents never approve:
// a pending baseline and results needing review wait for a person in Lumexia.

const idempotencyKeyArg = z.string().min(8).max(200).describe("Unique per intended change; retrying with the same key returns the first result");
const dryRunArg = z.boolean().optional().describe("Return the full plan and report without changing anything");

const failure = (error: unknown) =>
  error instanceof CoaImportRefused || error instanceof WriteRefused ? errorResult(error.message) : errorResult(error instanceof Error ? error.message : String(error));

export const registerQcReadTools: ToolRegistrar = (server) => {
  server.registerTool(
    "get_item_qc_parameters",
    {
      title: "Get item QC parameters",
      description:
        "An item's quality parameters with their specifications (type, limits, examination type, whether shown on the COA) and its " +
        "supplier-COA baseline state (none | pending | approved). Check it before importing a COA to see what already exists.",
      inputSchema: { item: z.string().min(1).describe("Item id or reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);
      const [fullItem, parameters, baseline] = await Promise.all([
        prisma.item.findUnique({ where: { id: item.id }, select: { isSold: true } }),
        prisma.qcItemParameter.findMany({
          where: { itemId: item.id },
          select: {
            id: true,
            parameter: { select: { id: true, name: true, uom: true, dataType: { select: { name: true } } } },
            specifications: { select: { id: true, name: true, specificationType: true, valueA: true, valueB: true, displayOnCoa: true, sourceItemFileId: true, examinationType: { select: { name: true } } } },
          },
          orderBy: { parameter: { name: "asc" } },
        }),
        prisma.qcItemBaseline.findUnique({ where: { itemId: item.id }, select: { status: true, sourceItemFileId: true, approvedAt: true } }),
      ]);
      return jsonResult({ item, isSold: fullItem?.isSold ?? false, baseline: baseline ?? null, parameters });
    },
  );

  server.registerTool(
    "get_lot_qc_results",
    {
      title: "Get lot QC results",
      description:
        "A lot's quality records and results, with where each result came from (manual or supplierCoa), its review state and reasons, " +
        "and the computed, suggested and supplier outcomes. Also lists the supplier-COA imports done for the lot.",
      inputSchema: { lotId: z.string().min(1) },
      annotations: { readOnlyHint: true },
    },
    async ({ lotId }) => {
      const lot = await prisma.lot.findUnique({ where: { id: lotId }, select: { id: true, lotNumber: true, supplierLotNumber: true, itemId: true } });
      if (!lot) return errorResult(`No lot ${lotId}. Use get_item_lots.`);
      const [records, imports] = await Promise.all([
        prisma.qcRecord.findMany({
          where: { examinedLotId: lot.id },
          select: {
            id: true,
            referenceCode: true,
            status: { select: { name: true } },
            examinationType: { select: { name: true } },
            sourceItemFileId: true,
            qcParameterResults: {
              select: {
                id: true,
                value: true,
                runNumber: true,
                reviewState: true,
                reviewReasons: true,
                source: true,
                sourceItemFileId: true,
                sourceFactId: true,
                computedOutcome: true,
                suggestedOutcome: true,
                supplierOutcome: true,
                qcItemParameter: { select: { parameter: { select: { name: true, uom: true } } } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.qcCoaImport.findMany({ where: { lotId: lot.id }, select: { itemFileId: true, qcRecordId: true, supersededAt: true, createdAt: true, report: true }, orderBy: { createdAt: "desc" } }),
      ]);
      return jsonResult({ lot, records, imports });
    },
  );
};

export const registerQcCoaImportTools: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "import_lot_coa_results",
    {
      title: "Import lot COA results",
      description:
        "Put a supplier COA's test_result facts into the lot's quality results. First store the COA's extraction " +
        "(store_document_extraction, one test_result fact per row, quote and page on each), then run this with dryRun to read the plan, then for real. " +
        "The COA must be filed against this lot (or carry the same supplier lot); otherwise nothing is imported. " +
        "Lumexia matches tests to existing parameters only on an exact name (ignoring case and punctuation) and otherwise creates a parameter with the " +
        "supplier's wording; it never fuzzy-merges. For resold items (isSold) the item's first COA seeds the specs from its printed limits and a " +
        "pending baseline that a person must approve; later lots are checked against the approved baseline (out of spec marks the dry QC record " +
        "outOfSpecification). Other items get parameters and informational results only. Pass/fail is computed by Lumexia against the spec; " +
        "your suggestions[].outcome only fills in where it can't be computed (qualitative or unparseable specs). Results from low-confidence " +
        "facts, newly created parameters, unit mismatches and disagreeing verdicts are marked needsReview and stay off generated COAs until a person confirms. " +
        "Importing again replaces results nobody has edited. The report lists every row, missing baseline tests and proposed additions.",
      inputSchema: {
        lotId: z.string().describe("Our lot id (get_item_lots)"),
        documentId: z.string().describe("The COA's item document id"),
        suggestions: z
          .array(
            z.object({
              factId: z.string().describe("A test_result fact of this COA"),
              outcome: z.enum(["pass", "fail"]).optional().describe("Your reading of pass/fail for this row"),
              parameterId: z.string().optional().describe("Use this existing parameter when the name is ambiguous"),
            }),
          )
          .max(500)
          .optional(),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async ({ idempotencyKey, dryRun, ...input }) => {
      try {
        const outcome = await runWrite(ctx, { tool: "import_lot_coa_results", args: input, idempotencyKey, dryRun }, (db) =>
          importLotCoaResults(db, { userId: ctx.user.id, apiKeyId: ctx.keyId }, input),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "undo_lot_coa_import",
    {
      title: "Undo lot COA import",
      description:
        "Take back an import: results nobody has edited or confirmed are deleted and the dry QC record reopens. Edited or confirmed results stay. " +
        "Parameters and specs the import created stay for a person to tidy.",
      inputSchema: { lotId: z.string(), documentId: z.string(), reason: z.string().min(3).max(1000), idempotencyKey: idempotencyKeyArg, dryRun: dryRunArg },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async ({ idempotencyKey, dryRun, reason, ...input }) => {
      try {
        const outcome = await runWrite(ctx, { tool: "undo_lot_coa_import", args: { ...input, reason }, idempotencyKey, dryRun }, (db) =>
          undoCoaImport(db, { userId: ctx.user.id, apiKeyId: ctx.keyId }, input),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );
};
