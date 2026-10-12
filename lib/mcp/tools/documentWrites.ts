import { z } from "zod";
import prisma from "@/lib/prisma";
import { createUploadTokens, UPLOAD_TTL_MINUTES } from "@/lib/apiUploads";
import { createItemDocuments, ItemDocumentDetails, setItemDocumentReplaced, updateItemDocument } from "@/lib/itemDocuments/mutations";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";
import { describeItemDocuments } from "./documents";
import {
  dateArg,
  describeFiling,
  detailsSchema,
  findDocument,
  resolveDetails,
  resolveFileType,
  resolveLot,
  resolvePurchaseOrder,
  resolveSupplier,
  toDate,
} from "../documentArgs";

// Write tools for filing item documents. Only registered for keys with the "write" scope.

export const registerDocumentWriteTools: ToolRegistrar = (server, ctx) => {
  const actor = { userId: ctx.user.id, via: "mcp" as const };

  server.registerTool(
    "create_document_upload",
    {
      title: "Create document upload links",
      description:
        `Get single-use upload links (valid ${UPLOAD_TTL_MINUTES} minutes) for local files. Upload each file with ` +
        '`curl -sS -F "file=@/path/to/file.pdf" <url>`; the response has a fileId to pass to attach_item_document. ' +
        "PDFs and images only, up to 50 MB.",
      inputSchema: {
        count: z.number().int().min(1).max(25).optional().describe("How many links (one per file, default 1)"),
      },
    },
    async ({ count }) => {
      const { tokens, expiresAt } = await createUploadTokens(ctx.keyId, count ?? 1);
      return jsonResult({
        expiresAt,
        uploadUrls: tokens.map((t) => `${ctx.origin}/api/mcp/uploads/${t}`),
        howTo: 'curl -sS -F "file=@/path/to/file.pdf" <uploadUrl>',
      });
    },
  );

  server.registerTool(
    "attach_item_document",
    {
      title: "Attach item document",
      description:
        "File an uploaded document (fileId from an upload link) under an item, with its type, issuer and details. " +
        "Like uploading in the Files tab, it replaces older current versions of the same document (same type, issuer, " +
        "lot and supplier). Current versions from a different or no supplier are left alone unless listed in " +
        "alsoReplaceDocumentIds; they're returned so you can ask. Returns the item's document status afterwards.",
      inputSchema: {
        fileId: z.string().describe("fileId returned by the upload link"),
        item: z.string().describe("Item id or reference code"),
        ...detailsSchema,
        alsoReplaceDocumentIds: z.array(z.string()).optional().describe("Other current documents this one replaces"),
      },
    },
    async (args) => {
      const upload = await prisma.apiUpload.findUnique({
        where: { fileId: args.fileId },
        select: { apiKeyId: true, file: { select: { name: true, itemFiles: { select: { id: true } } } } },
      });
      if (!upload || upload.apiKeyId !== ctx.keyId) {
        return errorResult("That fileId wasn't uploaded with this API key. Upload it with create_document_upload first.");
      }
      if (upload.file!.itemFiles.length > 0) return errorResult("That file is already attached. Upload it again to attach it elsewhere.");

      const item = await findItem(args.item);
      if (!item) return errorResult(`No item found for "${args.item}". Try search_items.`);
      const resolved = await resolveDetails(item.id, args);
      if ("error" in resolved) return errorResult(resolved.error);

      const result = await createItemDocuments(
        actor,
        item.id,
        [{ fileId: args.fileId, name: upload.file!.name }],
        resolved.details,
        args.alsoReplaceDocumentIds ?? []
      );
      return jsonResult({ item, ...(await describeFiling(item.id, result.itemFileIds[0], resolved.details, result)) });
    },
  );

  server.registerTool(
    "update_item_document",
    {
      title: "Update item document",
      description:
        "Change the details of a document already on file (type, issuer, supplier, lot, supplier lot, purchase order, " +
        "dates, revision, based on). " +
        "Only the fields given change; pass null to clear an optional field. Never replaces other documents.",
      inputSchema: {
        documentId: z.string().describe("Item document id (from get_item_documents)"),
        documentType: detailsSchema.documentType.optional(),
        issuer: detailsSchema.issuer.optional(),
        supplier: z.string().nullable().optional().describe("Supplier id or exact name, or null to clear"),
        lot: z.string().nullable().optional().describe("Lot number or id, or null to clear"),
        supplierLot: z.string().nullable().optional().describe("Supplier lot printed on the document, or null to clear"),
        purchaseOrder: z.union([z.number().int(), z.string()]).nullable().optional().describe("PO reference code, or null to clear"),
        issuedAt: dateArg.nullable().optional(),
        expiresAt: dateArg.nullable().optional(),
        revision: z.string().nullable().optional(),
        basedOnDocumentId: z.string().nullable().optional(),
      },
    },
    async (args) => {
      const doc = await findDocument(args.documentId);
      if (!doc) return errorResult("No document with that id. Use get_item_documents.");

      const type = args.documentType ? await resolveFileType(args.documentType) : null;
      if (type && "error" in type) return errorResult(type.error!);
      const supplier = args.supplier ? await resolveSupplier(args.supplier) : null;
      if (supplier && "error" in supplier) return errorResult(supplier.error!);
      const lot = args.lot ? await resolveLot(doc.itemId, args.lot) : null;
      if (lot && "error" in lot) return errorResult(lot.error!);
      const po = args.purchaseOrder ? await resolvePurchaseOrder(args.purchaseOrder) : null;
      if (po && "error" in po) return errorResult(po.error!);

      const details: ItemDocumentDetails = {
        fileTypeId: type?.type?.id ?? doc.fileTypeId,
        issuer: args.issuer ?? (doc.issuer === "internal" ? "internal" : "supplier"),
        supplierId: args.supplier === null ? null : supplier?.supplier?.id ?? doc.supplierId,
        lotId: args.lot === null ? null : lot?.lot?.id ?? doc.lotId,
        supplierLotNumber: args.supplierLot === undefined ? doc.supplierLotNumber : args.supplierLot,
        purchaseOrderId: args.purchaseOrder === null ? null : po?.purchaseOrder?.id ?? doc.purchaseOrderId,
        issuedAt: args.issuedAt === undefined ? doc.issuedAt : toDate(args.issuedAt) ?? null,
        expiresAt: args.expiresAt === undefined ? doc.expiresAt : toDate(args.expiresAt) ?? null,
        revision: args.revision === undefined ? doc.revision : args.revision,
        derivedFromId: args.basedOnDocumentId === undefined ? doc.derivedFromId : args.basedOnDocumentId,
      };
      if (details.issuedAt && details.expiresAt && details.expiresAt <= details.issuedAt) {
        return errorResult("expiresAt must be after issuedAt.");
      }

      if (args.basedOnDocumentId) {
        const source = await findDocument(args.basedOnDocumentId);
        if (!source || source.itemId !== doc.itemId) return errorResult("basedOnDocumentId must be a document of the same item.");
      }

      await updateItemDocument(actor, doc.id, details);
      const after = await describeItemDocuments(doc.itemId);
      return jsonResult({
        documentId: doc.id,
        document: after.documents.find((d) => d.documentId === doc.id),
        requirements: after.requirements.filter((r) => r.documentTypeId === details.fileTypeId),
      });
    },
  );

  server.registerTool(
    "set_document_replaced",
    {
      title: "Mark document replaced or current",
      description: "Mark a document as replaced (no longer current), or restore a replaced document as current.",
      inputSchema: {
        documentId: z.string().describe("Item document id"),
        replaced: z.boolean().describe("true = mark replaced, false = restore as current"),
      },
    },
    async ({ documentId, replaced }) => {
      const doc = await findDocument(documentId);
      if (!doc) return errorResult("No document with that id. Use get_item_documents.");
      await setItemDocumentReplaced(actor, documentId, replaced);
      const after = await describeItemDocuments(doc.itemId);
      return jsonResult({
        documentId,
        replaced,
        requirements: after.requirements.filter((r) => r.documentTypeId === doc.fileTypeId),
      });
    },
  );
};
