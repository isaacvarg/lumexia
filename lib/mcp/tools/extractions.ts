import { z } from "zod";
import prisma from "@/lib/prisma";
import { ensureSeedCatalog, listFactDefinitions } from "@/lib/documentExtractions/catalog";
import { documentContent } from "@/lib/documentExtractions/content";
import { describeFact, extractionStatusForDocuments, getExtraction, searchFacts } from "@/lib/documentExtractions/queries";
import { claimStatuses, factMethods, reviewStates } from "@/lib/documentExtractions/types";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";
import { resolveFileType, resolveSupplier } from "../documentArgs";

// Reading document extractions: what supplier documents say, fact by fact, so audits read the facts
// instead of downloading every file again. Extractions are keyed by file content (sha256): documents with
// the same file share one. They are unreviewed evidence until people verify facts, and never Canon.

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export const registerExtractionTools: ToolRegistrar = (server) => {
  server.registerTool(
    "list_fact_definitions",
    {
      title: "List fact definitions",
      description:
        "The fact catalog: every key an extraction can store, its kind (scalar, enum, claim, row, section), value shape " +
        "(valueSchema: a scalar's type, enum options, a row's columns), unit family, whether it's safety-relevant, its status " +
        "(approved, or proposed by an agent and not yet reviewed) and the document types it applies to (required = an " +
        "extraction of that type is incomplete without it).",
      inputSchema: {
        documentType: z.string().optional().describe("Only keys for this document type (id, name or abbreviation)"),
        includeProposed: z.boolean().optional().describe("Include keys agents proposed (default true)"),
        includeDeprecated: z.boolean().optional().describe("Include deprecated and merged keys (default false)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ documentType, includeProposed, includeDeprecated }) => {
      const type = documentType ? await resolveFileType(documentType) : null;
      if (type && "error" in type) return errorResult(type.error as string);
      const definitions = await listFactDefinitions(prisma, { fileTypeId: type?.type.id, includeProposed, includeDeprecated });
      return jsonResult(
        definitions.map((d) => ({
          key: d.key,
          label: d.label,
          ...(d.description && { description: d.description }),
          kind: d.kind,
          valueSchema: d.valueSchema,
          ...(d.unitFamily && { unitFamily: d.unitFamily }),
          safetyRelevant: d.safetyRelevant,
          status: d.status,
          ...(d.mergedInto && { mergedInto: d.mergedInto.key }),
          documentTypes: d.fileTypes.map((t) => ({ type: t.fileType.abbreviaton ?? t.fileType.name, required: t.required })),
        })),
      );
    },
  );

  server.registerTool(
    "get_document_extraction",
    {
      title: "Get document extraction",
      description:
        "What a document says, as facts with page, quote, reading method, confidence and whether a person verified them, " +
        "plus review state, required keys still missing, conflicts with facts people had verified, and every document " +
        "filed with the same file. Returns exists: false when the content hasn't been extracted. Pass the document id " +
        "(the file is hashed if it wasn't yet) or the file's sha256. Full text only with includeFullText.",
      inputSchema: {
        documentId: z.string().optional().describe("Item document id"),
        sha256: z.string().regex(/^[a-fA-F0-9]{64}$/).optional().describe("sha256 of the file (`sha256sum`)"),
        includeFullText: z.boolean().optional().describe("Include the document's full text (large; default false)"),
        includeHistory: z.boolean().optional().describe("Include the extraction's change history (default false)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ documentId, sha256, includeFullText, includeHistory }) => {
      if (!documentId && !sha256) return errorResult("Pass documentId or sha256.");
      let content = sha256?.toLowerCase();
      let replaced: boolean | undefined;
      if (documentId) {
        const found = await documentContent(documentId).catch((error: Error) => ({ error: error.message }));
        if (!found) return errorResult(`No item document ${documentId}. Use get_item_documents.`);
        if ("error" in found) return errorResult(`Couldn't read the document's file to hash it: ${found.error}`);
        if (content && content !== found.sha256) {
          return errorResult(`Document ${documentId} has content ${found.sha256}, not ${content}. Use the document's current file.`);
        }
        content = found.sha256;
        replaced = !!found.document.supersededAt;
      }
      await ensureSeedCatalog();
      const result = await getExtraction(prisma, content!, { includeFullText, includeHistory });
      return jsonResult({ ...(documentId && { documentId, documentReplaced: replaced }), ...result });
    },
  );

  server.registerTool(
    "get_item_extractions",
    {
      title: "Get item extractions",
      description:
        "Extraction status of each of an item's current documents: missing (nobody has extracted that file), current, " +
        "failed (unreadable; don't retry unless a person cleared it) or not_checked (the file couldn't be hashed yet; call " +
        "again). Current ones include review state and how many facts still need a person's check.",
      inputSchema: { item: z.string().min(1).describe("Item id or reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);
      const documents = await prisma.itemFile.findMany({
        where: { itemId: item.id, supersededAt: null },
        select: {
          id: true,
          issuer: true,
          issuedAt: true,
          revision: true,
          supplierLotNumber: true,
          fileType: { select: { name: true, abbreviaton: true } },
          supplier: { select: { id: true, name: true } },
          lot: { select: { lotNumber: true } },
          file: { select: { id: true, name: true, sha256: true, bucketName: true, objectName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      const statuses = await extractionStatusForDocuments(prisma, documents);
      return jsonResult({
        item,
        documents: documents.map((d) => ({
          documentId: d.id,
          name: d.file.name,
          type: d.fileType.abbreviaton ?? d.fileType.name,
          issuer: d.issuer,
          issued: day(d.issuedAt),
          ...(d.revision && { revision: d.revision }),
          ...(d.supplier && { supplier: d.supplier.name }),
          ...(d.lot && { lot: d.lot.lotNumber }),
          ...(d.supplierLotNumber && { supplierLot: d.supplierLotNumber }),
          ...statuses.get(d.id),
        })),
      });
    },
  );

  server.registerTool(
    "search_document_extractions",
    {
      title: "Search document extractions",
      description:
        "Find facts across current extractions, e.g. every flash point under 60 °C (factKey flashpoint, valueFilter " +
        "{op: lt, value: 60, unit: °C}), every Prop 65 row for a CAS, or vegan claims the supplier states. Numbers compare " +
        "in the key's canonical unit; for ranges, lt/lte test the lower bound and gt/gte the upper one; contains matches " +
        "the printed text. Returns facts with their extraction and documents, never full text.",
      inputSchema: {
        item: z.string().optional().describe("Only this item's current documents (id or reference code)"),
        supplier: z.string().optional().describe("Only documents from this supplier (id or name)"),
        documentType: z.string().optional().describe("Only documents of this type (id, name or abbreviation)"),
        factKey: z.string().optional().describe("Only this key; see list_fact_definitions"),
        valueFilter: z
          .object({
            op: z.enum(["lt", "lte", "gt", "gte", "eq", "contains"]),
            value: z.union([z.number(), z.string()]),
            unit: z.string().optional().describe("Unit of value, converted to the key's canonical unit (needs factKey)"),
          })
          .optional(),
        claimStatus: z.enum(claimStatuses).optional().describe("For claim keys: stated, negated or not_stated"),
        cas: z.string().optional().describe("Only component facts with this CAS"),
        reviewState: z.enum(reviewStates).optional(),
        method: z.enum(factMethods).optional(),
        needsHumanCheck: z.boolean().optional().describe("true = only facts still waiting for a person's check"),
        status: z.enum(["current", "superseded"]).optional().describe("Extraction status (default current)"),
        limit: z.number().int().min(1).max(200).optional().describe("Max facts (default 50)"),
        cursor: z.string().optional().describe("nextCursor from the previous page"),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      await ensureSeedCatalog();
      const definition = args.factKey
        ? await prisma.factDefinition.findUnique({ where: { key: args.factKey }, select: { key: true, unitFamily: true } })
        : null;
      if (args.factKey && !definition) return errorResult(`No fact key "${args.factKey}". See list_fact_definitions.`);

      // narrowing by item, supplier or type means narrowing to the content of those documents
      let sha256s: string[] | undefined;
      if (args.item || args.supplier || args.documentType) {
        const item = args.item ? await findItem(args.item) : null;
        if (args.item && !item) return errorResult(`No item found for "${args.item}".`);
        const supplier = args.supplier ? await resolveSupplier(args.supplier) : null;
        if (supplier && "error" in supplier) return errorResult(supplier.error as string);
        const type = args.documentType ? await resolveFileType(args.documentType) : null;
        if (type && "error" in type) return errorResult(type.error as string);
        const files = await prisma.itemFile.findMany({
          where: {
            ...(item && { itemId: item.id, supersededAt: null }),
            ...(supplier && { supplierId: supplier.supplier.id }),
            ...(type && { fileTypeId: type.type.id }),
          },
          select: { file: { select: { sha256: true } } },
        });
        sha256s = Array.from(new Set(files.map((f) => f.file.sha256).filter((s): s is string => !!s)));
      }

      const limit = args.limit ?? 50;
      const result = await searchFacts(prisma, {
        sha256s,
        factKey: definition?.key,
        unitFamily: definition?.unitFamily,
        valueFilter: args.valueFilter,
        claimStatus: args.claimStatus,
        cas: args.cas,
        reviewState: args.reviewState,
        method: args.method,
        needsHumanCheck: args.needsHumanCheck,
        status: args.status,
        limit,
        cursor: args.cursor,
      });
      if ("error" in result) return errorResult(result.error as string);

      const shas = Array.from(new Set(result.facts.map((f) => f.extraction.sha256)));
      const documents = shas.length
        ? await prisma.itemFile.findMany({
            where: { file: { sha256: { in: shas } } },
            select: {
              id: true,
              supersededAt: true,
              file: { select: { sha256: true } },
              fileType: { select: { name: true, abbreviaton: true } },
              item: { select: { id: true, name: true, referenceCode: true } },
              supplier: { select: { name: true } },
            },
          })
        : [];
      const docsBySha = new Map<string, unknown[]>();
      for (const d of documents) {
        const list = docsBySha.get(d.file.sha256!) ?? [];
        list.push({ documentId: d.id, item: d.item, type: d.fileType.abbreviaton ?? d.fileType.name, ...(d.supplier && { supplier: d.supplier.name }), replaced: !!d.supersededAt });
        docsBySha.set(d.file.sha256!, list);
      }

      return jsonResult({
        facts: result.facts.map((f) => ({
          ...describeFact(f),
          extraction: { id: f.extraction.id, reviewState: f.extraction.reviewState, ...(f.extraction.status !== "current" && { status: f.extraction.status }) },
          documents: docsBySha.get(f.extraction.sha256) ?? [],
        })),
        nextCursor: result.nextCursor,
      });
    },
  );
};
