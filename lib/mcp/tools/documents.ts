import { z } from "zod";
import prisma from "@/lib/prisma";
import { getItemDocumentStatus } from "@/lib/itemDocuments/queries";
import { getDocumentDashboard } from "@/lib/itemDocuments/dashboard";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";
import { createDownloadUrl, DOWNLOAD_TTL_MINUTES } from "@/lib/apiDownloads";

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
const md5Of = (etag: string) => etag.replace(/"/g, "").toLowerCase();

const fileTypeLabel = (t: { name: string; abbreviaton: string | null }) =>
  t.abbreviaton ? `${t.name} (${t.abbreviaton})` : t.name;

// Everything one item has on file and what its requirements expect, in one response.
export const describeItemDocuments = async (itemId: string) => {
  const [status, files, fileTypes] = await Promise.all([
    getItemDocumentStatus(prisma, itemId),
    prisma.itemFile.findMany({
      where: { itemId },
      select: {
        id: true,
        fileTypeId: true,
        issuer: true,
        issuedAt: true,
        expiresAt: true,
        revision: true,
        supersededAt: true,
        derivedFromId: true,
        createdAt: true,
        supplier: { select: { id: true, name: true } },
        lot: { select: { id: true, lotNumber: true } },
        file: { select: { name: true, etag: true } },
      },
      orderBy: [{ supersededAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
    }),
    prisma.itemFileType.findMany({ select: { id: true, name: true, abbreviaton: true } }),
  ]);

  const typeName = new Map(fileTypes.map((t) => [t.id, fileTypeLabel(t)]));
  const fileName = new Map(files.map((f) => [f.id, f.file.name]));

  return {
    requirements: (status?.requirements ?? []).map((r) => ({
      document: typeName.get(r.requirement.fileTypeId),
      documentTypeId: r.requirement.fileTypeId,
      issuer: r.requirement.issuer,
      level: r.requirement.level,
      scope: r.requirement.scope,
      status: r.status,
      validForMonths: r.requirement.validForMonths,
      issuedOnOrAfter: day(r.requirement.minIssuedAt),
      note: r.requirement.notes,
      current: r.documents.map((d) => ({ documentId: d.documentId, name: fileName.get(d.documentId), status: d.status, expires: day(d.effectiveExpiresAt) })),
      lots: r.lots
        ?.filter((l) => l.counted)
        .map((l) => ({ lotNumber: l.lotNumber, lotId: l.lotId, status: l.status, documentId: l.documents[0]?.documentId ?? null })),
    })),
    documents: files.map((f) => ({
      documentId: f.id,
      name: f.file.name,
      type: typeName.get(f.fileTypeId),
      issuer: f.issuer,
      supplier: f.supplier?.name ?? null,
      lot: f.lot?.lotNumber ?? null,
      issued: day(f.issuedAt),
      expires: day(f.expiresAt),
      revision: f.revision,
      replaced: day(f.supersededAt),
      basedOn: f.derivedFromId ? fileName.get(f.derivedFromId) ?? f.derivedFromId : null,
      md5: md5Of(f.file.etag),
    })),
  };
};

export const registerDocumentTools: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "list_document_types",
    {
      title: "List document types",
      description: "The document types items can have (SDS, COA, IFRA, TDS…), with ids to use in document tools.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const types = await prisma.itemFileType.findMany({
        select: { id: true, name: true, abbreviaton: true, description: true },
        orderBy: { name: "asc" },
      });
      return jsonResult(types.map((t) => ({ id: t.id, name: t.name, abbreviation: t.abbreviaton, description: t.description })));
    },
  );

  server.registerTool(
    "search_suppliers",
    {
      title: "Search suppliers",
      description: "Find suppliers by name or alias, e.g. the company named on a supplier document.",
      inputSchema: {
        query: z.string().min(1).describe("Part of the supplier's name or an alias"),
        limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      const contains = { contains: query.trim(), mode: "insensitive" as const };
      const suppliers = await prisma.supplier.findMany({
        where: { OR: [{ name: contains }, { supplierAlias: { some: { alias: { name: contains } } } }] },
        select: { id: true, name: true, supplierAlias: { select: { alias: { select: { name: true } } } } },
        orderBy: { name: "asc" },
        take: limit ?? 10,
      });
      return jsonResult(suppliers.map((s) => ({ id: s.id, name: s.name, aliases: s.supplierAlias.map((a) => a.alias.name) })));
    },
  );

  server.registerTool(
    "get_item_documents",
    {
      title: "Get item documents",
      description:
        "An item's document requirements with their status (current, expiring, undated, stale, expired, missing), " +
        "per-lot status for lot documents, and every document on file including replaced versions. " +
        "Use before attaching a document to see what the item still needs.",
      inputSchema: { item: z.string().min(1).describe("Item id or reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);
      return jsonResult({ item, ...(await describeItemDocuments(item.id)) });
    },
  );

  server.registerTool(
    "get_document_issues",
    {
      title: "Get document issues",
      description:
        "Required documents that need attention across all items: missing, expired, expiring, undated, or stale " +
        "(our version is based on a supplier document that has since been replaced). Each issue has the supplier " +
        "to ask when known. Filter to narrow it down.",
      inputSchema: {
        statuses: z.array(z.enum(["missing", "expired", "expiring", "undated", "stale"])).optional().describe("Only these statuses"),
        issuer: z.enum(["supplier", "internal"]).optional().describe("Only supplier documents or only our own"),
        item: z.string().optional().describe("Only this item (id or reference code)"),
        documentType: z.string().optional().describe("Only this document type (id, name or abbreviation)"),
        supplier: z.string().optional().describe("Only issues for this supplier (id or exact name)"),
        limit: z.number().int().min(1).max(500).optional().describe("Max issues (default 100)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ statuses, issuer, item: itemArg, documentType, supplier, limit }) => {
      const data = await getDocumentDashboard(prisma);
      const item = itemArg ? await findItem(itemArg) : null;
      if (itemArg && !item) return errorResult(`No item found for "${itemArg}".`);
      const type = documentType ? data.fileTypes.find((t) => [t.id, t.name, t.abbreviaton].some((v) => v?.toLowerCase() === documentType.toLowerCase())) : null;
      const sup = supplier ? data.suppliers.find((s) => s.id === supplier || s.name.toLowerCase() === supplier.toLowerCase()) : null;

      const items = new Map(data.items.map((i) => [i.id, i]));
      const lots = new Map(data.lots.map((l) => [l.id, l.lotNumber]));
      const suppliers = new Map(data.suppliers.map((s) => [s.id, s.name]));
      const types = new Map(data.fileTypes.map((t) => [t.id, fileTypeLabel(t)]));

      const issues = data.issues.filter(
        (i) =>
          (!statuses?.length || statuses.includes(i.status as (typeof statuses)[number])) &&
          (!issuer || i.issuer === issuer || i.issuer === "any") &&
          (!item || i.itemId === item.id) &&
          (!documentType || i.fileTypeId === type?.id) &&
          (!supplier || i.supplierId === sup?.id)
      );
      const max = limit ?? 100;
      return jsonResult({
        summary: data.summary,
        matching: issues.length,
        truncated: issues.length > max,
        issues: issues.slice(0, max).map((i) => ({
          item: items.get(i.itemId) && { id: i.itemId, name: items.get(i.itemId)!.name, referenceCode: items.get(i.itemId)!.referenceCode },
          document: types.get(i.fileTypeId),
          issuer: i.issuer,
          lot: i.lotId ? lots.get(i.lotId) ?? null : null,
          status: i.status,
          expires: day(i.expiresAt),
          supplier: i.supplierId ? { name: suppliers.get(i.supplierId), source: i.supplierSource } : null,
        })),
      });
    },
  );

  server.registerTool(
    "find_documents_by_checksum",
    {
      title: "Find documents by checksum",
      description:
        "Check whether files were already uploaded, by MD5 (run `md5sum` on the local files). Use before uploading " +
        "a folder so the same file isn't filed twice. Returns the item documents each checksum is already attached to.",
      inputSchema: {
        md5: z.array(z.string().regex(/^[a-fA-F0-9]{32}$/)).min(1).max(200).describe("MD5 hex digests"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ md5 }) => {
      const wanted = md5.map((m) => m.toLowerCase());
      const files = await prisma.file.findMany({
        where: { etag: { in: wanted.flatMap((m) => [m, `"${m}"`]) } },
        select: {
          etag: true,
          name: true,
          itemFiles: {
            select: {
              id: true,
              supersededAt: true,
              item: { select: { id: true, name: true, referenceCode: true } },
              fileType: { select: { name: true, abbreviaton: true } },
            },
          },
        },
      });
      return jsonResult(
        wanted.map((m) => {
          const matches = files.filter((f) => md5Of(f.etag) === m);
          return {
            md5: m,
            alreadyUploaded: matches.length > 0,
            attachedTo: matches.flatMap((f) =>
              f.itemFiles.map((d) => ({
                documentId: d.id,
                name: f.name,
                item: d.item,
                type: fileTypeLabel(d.fileType),
                replaced: !!d.supersededAt,
              }))
            ),
          };
        })
      );
    },
  );

  server.registerTool(
    "get_document_downloads",
    {
      title: "Get document downloads",
      description:
        `Download links (valid ${DOWNLOAD_TTL_MINUTES} minutes) for item documents, by the documentId from ` +
        "get_item_documents. Save each with `curl -sS -o <filename> <url>`; the file never passes through this call.",
      inputSchema: {
        documentIds: z.array(z.string().uuid()).min(1).max(25).describe("Item document ids"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ documentIds }) => {
      const documents = await prisma.itemFile.findMany({
        where: { id: { in: documentIds } },
        select: {
          id: true,
          item: { select: { name: true, referenceCode: true } },
          file: { select: { name: true, size: true, mimeType: true } },
        },
      });
      const found = new Set(documents.map((d) => d.id));

      return jsonResult({
        expiresInMinutes: DOWNLOAD_TTL_MINUTES,
        howTo: "curl -sS -o <filename> <url>",
        downloads: documents.map((d) => ({
          documentId: d.id,
          item: d.item,
          filename: d.file.name,
          bytes: d.file.size,
          mimeType: d.file.mimeType,
          url: createDownloadUrl(ctx.origin, d.id, ctx.keyId),
        })),
        notFound: documentIds.filter((id) => !found.has(id)),
      });
    },
  );
};
