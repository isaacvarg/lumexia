import { z } from "zod";
import prisma from "@/lib/prisma";
import { createDownloadUrl, DOWNLOAD_TTL_MINUTES } from "@/lib/apiDownloads";
import { effectiveStatus, findOnFileByMd5, getInboxCounts, listInboxDocuments, readSuggestion } from "@/lib/documentInbox/queries";
import {
  fileInboxDocumentToItem,
  fileInboxDocumentToPurchaseOrder,
  InboxError,
  saveInboxSuggestion,
} from "@/lib/documentInbox/mutations";
import { InboxSuggestion } from "@/lib/documentInbox/types";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";
import { dateArg, describeFiling, detailsSchema, resolveDetails, resolveFileType, resolvePurchaseOrder, resolveSupplier } from "../documentArgs";

// The document inbox over MCP. Anyone can look (e.g. Hermes notifying people about what's waiting);
// write keys can file inbox documents, which then wait for a person to check them, or leave a suggestion
// for the person who files it.

const views = ["review", "pending", "agentFiled", "filed", "dismissed"] as const;

const loadForAgent = (inboxDocumentId: string) =>
  prisma.inboxDocument.findUnique({
    where: { id: inboxDocumentId },
    select: { id: true, status: true, filings: { select: { id: true } } },
  });

export const registerInboxTools: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "get_document_inbox",
    {
      title: "Get document inbox",
      description:
        "Documents that arrived from outside (supplier emails) and are waiting in Lumexia's document inbox, with " +
        "who sent them, the email subject, the agent's suggestion or filing, and where an identical file is already " +
        "on file. view: review (default; unfiled plus agent filings nobody has checked), pending, agentFiled, filed, " +
        `dismissed. Each document has a download link valid ${DOWNLOAD_TTL_MINUTES} minutes (curl -o <file> <url>).`,
      inputSchema: {
        view: z.enum(views).optional(),
        limit: z.number().int().min(1).max(100).optional().describe("Default 25"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ view, limit }) => {
      const [counts, rows] = await Promise.all([getInboxCounts(prisma), listInboxDocuments(prisma, view ?? "review", limit ?? 25)]);
      const onFile = await findOnFileByMd5(prisma, rows.map((r) => r.md5));
      return jsonResult({
        counts,
        documents: rows.map((d) => ({
          inboxDocumentId: d.id,
          status: effectiveStatus(d),
          fileName: d.file.name,
          mimeType: d.file.mimeType,
          downloadUrl: createDownloadUrl(ctx.origin, d.id, ctx.keyId),
          receivedAt: d.message.receivedAt ?? d.message.createdAt,
          from: d.message.senderName ? `${d.message.senderName} <${d.message.senderEmail ?? ""}>` : d.message.senderEmail,
          subject: d.message.subject,
          source: d.message.source,
          link: d.message.sourceUrl,
          senderSupplier: d.message.supplier,
          suggestion: readSuggestion(d.suggestion),
          filings: d.filings.map((f) => ({
            via: f.via,
            reason: f.reason,
            item: f.itemFile ? { ...f.itemFile.item, documentId: f.itemFile.id, type: f.itemFile.fileType.name, lot: f.itemFile.lot?.lotNumber ?? null } : undefined,
            purchaseOrder: f.poAccountingFile ? { referenceCode: f.poAccountingFile.purchaseOrder.referenceCode, type: f.poAccountingFile.fileType.name } : undefined,
          })),
          identicalFileOnFile: (onFile.get(d.md5) ?? []).map((o) => o.label),
          dismissReason: d.dismissReason ?? undefined,
        })),
      });
    },
  );
};

export const registerInboxWriteTools: ToolRegistrar = (server, ctx) => {
  const actor = { userId: ctx.user.id, via: "agent" as const };

  const pendingOrError = async (inboxDocumentId: string) => {
    const doc = await loadForAgent(inboxDocumentId);
    if (!doc) return "No inbox document with that id. Use the ids from the inbox upload or get_document_inbox.";
    if (doc.status === "dismissed") return "That document was dismissed in the inbox; leave it.";
    if (doc.status === "filed" && doc.filings.length > 0) return "That document is already filed. A person can file it elsewhere from the inbox.";
    return null;
  };

  server.registerTool(
    "file_inbox_document",
    {
      title: "File inbox document under an item",
      description:
        "File a document from the inbox under an item, like attach_item_document but for a file that's already in " +
        "the inbox (no upload needed). Only do this when exactly one item clearly matches; otherwise use " +
        "suggest_inbox_document. Your reason is shown to the person who checks the filing. Replaces older current " +
        "versions of the same document like an upload does.",
      inputSchema: {
        inboxDocumentId: z.string(),
        item: z.string().describe("Item id or reference code"),
        ...detailsSchema,
        alsoReplaceDocumentIds: z.array(z.string()).optional().describe("Other current documents this one replaces"),
        reason: z.string().min(1).describe("Why this is the right item and document type, in a sentence or two"),
      },
    },
    async (args) => {
      const problem = await pendingOrError(args.inboxDocumentId);
      if (problem) return errorResult(problem);
      const item = await findItem(args.item);
      if (!item) return errorResult(`No item found for "${args.item}". Try search_items.`);
      const resolved = await resolveDetails(item.id, args);
      if ("error" in resolved) return errorResult(resolved.error);

      try {
        const result = await fileInboxDocumentToItem(actor, args.inboxDocumentId, item.id, resolved.details, {
          alsoReplace: args.alsoReplaceDocumentIds,
          reason: args.reason,
        });
        return jsonResult({ item, ...(await describeFiling(item.id, result.itemFileId, resolved.details, result)), checkedByPerson: false });
      } catch (e) {
        if (e instanceof InboxError) return errorResult(e.message);
        throw e;
      }
    },
  );

  server.registerTool(
    "file_inbox_document_to_purchase_order",
    {
      title: "File inbox document on a purchase order",
      description:
        "File an inbox document (invoice, packing slip, order confirmation…) on a purchase order's accounting files. " +
        "For item documents (SDS, COA…) use file_inbox_document instead.",
      inputSchema: {
        inboxDocumentId: z.string(),
        purchaseOrder: z.union([z.number().int(), z.string()]).describe("PO reference code"),
        fileType: z.string().optional().describe("Accounting file type name, e.g. Invoice. Defaults to General"),
        reason: z.string().min(1).describe("Why this document belongs to this PO"),
      },
    },
    async (args) => {
      const problem = await pendingOrError(args.inboxDocumentId);
      if (problem) return errorResult(problem);
      const po = await resolvePurchaseOrder(args.purchaseOrder);
      if ("error" in po) return errorResult(po.error!);

      const types = await prisma.poAccountingFileType.findMany({ select: { id: true, name: true } });
      const wanted = (args.fileType ?? "general").trim().toLowerCase();
      const type = types.find((t) => t.name.toLowerCase() === wanted) ?? (args.fileType ? undefined : types[0]);
      if (!type) return errorResult(`Unknown accounting file type "${args.fileType}". Types: ${types.map((t) => t.name).join(", ")}.`);

      try {
        await fileInboxDocumentToPurchaseOrder(actor, args.inboxDocumentId, po.purchaseOrder!.id, type.id, { reason: args.reason });
        return jsonResult({ filed: true, purchaseOrder: po.purchaseOrder!.referenceCode, fileType: type.name, checkedByPerson: false });
      } catch (e) {
        if (e instanceof InboxError) return errorResult(e.message);
        throw e;
      }
    },
  );

  server.registerTool(
    "suggest_inbox_document",
    {
      title: "Suggest where an inbox document goes",
      description:
        "Leave your best guess on an inbox document you couldn't file confidently (no clear match, several likely " +
        "items, or unsure of the type). It prefills the form for the person who files it. Include what you read on " +
        "the document even when the item is unknown. Unknown names are left out rather than failing.",
      inputSchema: {
        inboxDocumentId: z.string(),
        reason: z.string().min(1).describe("What the document is and why it wasn't filed, e.g. 'SDS for Lavender 40/42; two items match'"),
        target: z.enum(["item", "purchaseOrder"]).optional(),
        item: z.string().optional().describe("Most likely item id or reference code"),
        documentType: z.string().optional(),
        issuer: z.enum(["supplier", "internal"]).optional(),
        supplier: z.string().optional(),
        supplierLot: z.string().optional(),
        purchaseOrder: z.union([z.number().int(), z.string()]).optional(),
        issuedAt: dateArg.optional(),
        expiresAt: dateArg.optional(),
        revision: z.string().optional(),
        confidence: z.enum(["low", "medium", "high"]).optional(),
      },
    },
    async (args) => {
      const doc = await loadForAgent(args.inboxDocumentId);
      if (!doc) return errorResult("No inbox document with that id.");

      const item = args.item ? await findItem(args.item) : null;
      const type = args.documentType ? await resolveFileType(args.documentType) : null;
      const supplier = args.supplier ? await resolveSupplier(args.supplier) : null;
      const po = args.purchaseOrder !== undefined ? await resolvePurchaseOrder(args.purchaseOrder) : null;

      const suggestion: InboxSuggestion = {
        target: args.target ?? (item || type ? "item" : po && "purchaseOrder" in po ? "purchaseOrder" : undefined),
        item: item ?? null,
        fileType: type && "type" in type ? { id: type.type!.id, name: type.type!.name } : null,
        issuer: args.issuer ?? null,
        supplier: supplier && "supplier" in supplier ? supplier.supplier! : null,
        supplierLot: args.supplierLot ?? null,
        purchaseOrder: po && "purchaseOrder" in po ? po.purchaseOrder! : null,
        issuedAt: args.issuedAt ?? null,
        expiresAt: args.expiresAt ?? null,
        revision: args.revision ?? null,
        confidence: args.confidence ?? null,
        reason: args.reason,
      };
      await saveInboxSuggestion(doc.id, suggestion);

      const unresolved = [
        args.item && !item && `item "${args.item}"`,
        type && "error" in type && `document type "${args.documentType}"`,
        supplier && "error" in supplier && `supplier "${args.supplier}"`,
        po && "error" in po && `purchase order "${args.purchaseOrder}"`,
      ].filter(Boolean);
      return jsonResult({ saved: true, suggestion, notFound: unresolved.length > 0 ? unresolved : undefined });
    },
  );
};
