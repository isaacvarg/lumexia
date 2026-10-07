import { z } from "zod";
import prisma from "@/lib/prisma";
import { createUploadTokens, UPLOAD_TTL_MINUTES } from "@/lib/apiUploads";
import { createItemDocuments, ItemDocumentDetails, setItemDocumentReplaced, updateItemDocument } from "@/lib/itemDocuments/mutations";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";
import { describeItemDocuments } from "./documents";

// Write tools for filing item documents. Only registered for keys with the "write" scope.

const dateArg = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .describe("Date printed on the document, YYYY-MM-DD");

// document dates are calendar dates, stored as UTC midnight like the Files tab does
const toDate = (v: string | null | undefined) => (v ? new Date(`${v}T00:00:00Z`) : v === null ? null : undefined);

const resolveFileType = async (input: string) => {
  const types = await prisma.itemFileType.findMany({ select: { id: true, name: true, abbreviaton: true } });
  const v = input.trim().toLowerCase();
  const exact = types.filter((t) => t.id === input || t.name.toLowerCase() === v || t.abbreviaton?.toLowerCase() === v);
  if (exact.length === 1) return { type: exact[0] };
  const partial = types.filter((t) => t.name.toLowerCase().includes(v));
  if (partial.length === 1) return { type: partial[0] };
  return { error: `Document type "${input}" is ${exact.length + partial.length > 1 ? "ambiguous" : "unknown"}. Use list_document_types.` };
};

const resolveSupplier = async (input: string) => {
  const v = input.trim();
  const byId = await prisma.supplier.findUnique({ where: { id: v }, select: { id: true, name: true } }).catch(() => null);
  if (byId) return { supplier: byId };
  const matches = await prisma.supplier.findMany({
    where: {
      OR: [
        { name: { equals: v, mode: "insensitive" } },
        { supplierAlias: { some: { alias: { name: { equals: v, mode: "insensitive" } } } } },
      ],
    },
    select: { id: true, name: true },
  });
  if (matches.length === 1) return { supplier: matches[0] };
  return {
    error: matches.length > 1
      ? `Supplier "${input}" matches ${matches.map((m) => m.name).join(", ")}. Pass the supplier id.`
      : `No supplier named "${input}". Use search_suppliers and pass its id.`,
  };
};

const resolveLot = async (itemId: string, input: string) => {
  const v = input.trim();
  const lots = await prisma.lot.findMany({
    where: { itemId, OR: [{ id: v }, { lotNumber: { equals: v, mode: "insensitive" } }] },
    select: { id: true, lotNumber: true },
  });
  if (lots.length === 1) return { lot: lots[0] };
  return { error: lots.length > 1 ? `Lot "${input}" is ambiguous for this item. Pass the lot id.` : `This item has no lot "${input}". Use get_item_lots.` };
};

const findDocument = (documentId: string) =>
  prisma.itemFile.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      itemId: true,
      fileTypeId: true,
      issuer: true,
      supplierId: true,
      lotId: true,
      issuedAt: true,
      expiresAt: true,
      revision: true,
      derivedFromId: true,
      file: { select: { name: true } },
    },
  });

const detailsSchema = {
  documentType: z.string().describe("Document type id, name or abbreviation, e.g. SDS"),
  issuer: z.enum(["supplier", "internal"]).describe("supplier = issued by the supplier/manufacturer; internal = issued or rebranded by us"),
  supplier: z.string().optional().describe("Supplier id or exact name. Optional for internal documents"),
  lot: z.string().optional().describe("Our lot number or lot id, for lot-specific documents like a COA"),
  issuedAt: dateArg.optional(),
  expiresAt: dateArg.optional().describe("Only if an expiry date is printed on the document, YYYY-MM-DD"),
  revision: z.string().optional().describe("Revision or version printed on the document"),
  basedOnDocumentId: z.string().optional().describe("For internal documents: the supplier document it was made from"),
};

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
      const type = await resolveFileType(args.documentType);
      if ("error" in type) return errorResult(type.error!);
      const supplier = args.supplier ? await resolveSupplier(args.supplier) : null;
      if (supplier && "error" in supplier) return errorResult(supplier.error!);
      const lot = args.lot ? await resolveLot(item.id, args.lot) : null;
      if (lot && "error" in lot) return errorResult(lot.error!);

      if (args.basedOnDocumentId) {
        const source = await findDocument(args.basedOnDocumentId);
        if (args.issuer !== "internal") return errorResult("Only internal documents can be based on another document.");
        if (!source || source.itemId !== item.id) return errorResult("basedOnDocumentId must be a document of the same item.");
      }

      const details: ItemDocumentDetails = {
        fileTypeId: type.type!.id,
        issuer: args.issuer,
        supplierId: supplier?.supplier?.id ?? null,
        lotId: lot?.lot?.id ?? null,
        issuedAt: toDate(args.issuedAt) ?? null,
        expiresAt: toDate(args.expiresAt) ?? null,
        revision: args.revision ?? null,
        derivedFromId: args.basedOnDocumentId ?? null,
      };
      if (details.issuedAt && details.expiresAt && details.expiresAt <= details.issuedAt) {
        return errorResult("expiresAt must be after issuedAt.");
      }

      const alsoReplace = args.alsoReplaceDocumentIds ?? [];
      const result = await createItemDocuments(actor, item.id, [{ fileId: args.fileId, name: upload.file!.name }], details, alsoReplace);
      const documentId = result.itemFileIds[0];

      // current versions of the same document from another (or no) supplier that this didn't replace
      const otherCurrent = await prisma.itemFile.findMany({
        where: {
          itemId: item.id,
          id: { not: documentId },
          fileTypeId: details.fileTypeId,
          issuer: details.issuer,
          lotId: details.lotId,
          supersededAt: null,
          // NULL never equals anything in SQL, so "different supplier" has to spell out the no-supplier case
          ...(details.supplierId
            ? { OR: [{ supplierId: null }, { supplierId: { not: details.supplierId } }] }
            : { supplierId: { not: null } }),
        },
        select: { id: true, file: { select: { name: true } }, supplier: { select: { name: true } } },
      });

      const after = await describeItemDocuments(item.id);
      return jsonResult({
        documentId,
        item,
        replaced: result.replacedIds,
        filedAsOlderVersion: result.filedAsOlderIds.length > 0
          ? "A newer version is already current, so this was filed as a replaced (older) version."
          : undefined,
        otherCurrentVersions: otherCurrent.map((d) => ({ documentId: d.id, name: d.file.name, supplier: d.supplier?.name ?? null })),
        requirements: after.requirements.filter((r) => r.documentTypeId === details.fileTypeId),
      });
    },
  );

  server.registerTool(
    "update_item_document",
    {
      title: "Update item document",
      description:
        "Change the details of a document already on file (type, issuer, supplier, lot, dates, revision, based on). " +
        "Only the fields given change; pass null to clear an optional field. Never replaces other documents.",
      inputSchema: {
        documentId: z.string().describe("Item document id (from get_item_documents)"),
        documentType: detailsSchema.documentType.optional(),
        issuer: detailsSchema.issuer.optional(),
        supplier: z.string().nullable().optional().describe("Supplier id or exact name, or null to clear"),
        lot: z.string().nullable().optional().describe("Lot number or id, or null to clear"),
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

      const details: ItemDocumentDetails = {
        fileTypeId: type?.type?.id ?? doc.fileTypeId,
        issuer: args.issuer ?? (doc.issuer === "internal" ? "internal" : "supplier"),
        supplierId: args.supplier === null ? null : supplier?.supplier?.id ?? doc.supplierId,
        lotId: args.lot === null ? null : lot?.lot?.id ?? doc.lotId,
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
