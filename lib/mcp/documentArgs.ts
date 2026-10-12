import { z } from "zod";
import prisma from "@/lib/prisma";
import { ItemDocumentDetails } from "@/lib/itemDocuments/mutations";
import { describeItemDocuments } from "./tools/documents";

// Arguments for filing item documents, shared by attach_item_document and the inbox tools: agents name
// things the way people do (SDS, a supplier's name, a PO number) and these resolve them to ids.

export const dateArg = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .describe("Date printed on the document, YYYY-MM-DD");

// document dates are calendar dates, stored as UTC midnight like the Files tab does
export const toDate = (v: string | null | undefined) => (v ? new Date(`${v}T00:00:00Z`) : v === null ? null : undefined);

export const resolveFileType = async (input: string) => {
  const types = await prisma.itemFileType.findMany({ select: { id: true, name: true, abbreviaton: true } });
  const v = input.trim().toLowerCase();
  const exact = types.filter((t) => t.id === input || t.name.toLowerCase() === v || t.abbreviaton?.toLowerCase() === v);
  if (exact.length === 1) return { type: exact[0] };
  const partial = types.filter((t) => t.name.toLowerCase().includes(v));
  if (partial.length === 1) return { type: partial[0] };
  return { error: `Document type "${input}" is ${exact.length + partial.length > 1 ? "ambiguous" : "unknown"}. Use list_document_types.` };
};

export const resolveSupplier = async (input: string) => {
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

export const resolveLot = async (itemId: string, input: string) => {
  const v = input.trim();
  const lots = await prisma.lot.findMany({
    where: { itemId, OR: [{ id: v }, { lotNumber: { equals: v, mode: "insensitive" } }] },
    select: { id: true, lotNumber: true },
  });
  if (lots.length === 1) return { lot: lots[0] };
  return { error: lots.length > 1 ? `Lot "${input}" is ambiguous for this item. Pass the lot id.` : `This item has no lot "${input}". Use get_item_lots.` };
};

export const resolvePurchaseOrder = async (input: string | number) => {
  const digits = String(input).match(/\d+/)?.[0];
  const po = digits ? await prisma.purchaseOrder.findFirst({ where: { referenceCode: Number(digits) }, select: { id: true, referenceCode: true } }) : null;
  return po ? { purchaseOrder: po } : { error: `No purchase order "${input}". Use search_purchase_orders.` };
};

export const findDocument = (documentId: string) =>
  prisma.itemFile.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      itemId: true,
      fileTypeId: true,
      issuer: true,
      supplierId: true,
      lotId: true,
      supplierLotNumber: true,
      purchaseOrderId: true,
      issuedAt: true,
      expiresAt: true,
      revision: true,
      derivedFromId: true,
      file: { select: { name: true } },
    },
  });

export const detailsSchema = {
  documentType: z.string().describe("Document type id, name or abbreviation, e.g. SDS"),
  issuer: z.enum(["supplier", "internal"]).describe("supplier = issued by the supplier/manufacturer; internal = issued or rebranded by us"),
  supplier: z.string().optional().describe("Supplier id or exact name. Optional for internal documents"),
  lot: z.string().optional().describe("Our lot number or lot id, for lot-specific documents like a COA, when you know it"),
  supplierLot: z
    .string()
    .optional()
    .describe(
      "The supplier's lot/batch number printed on a lot document (e.g. a COA). Without `lot`, it's matched to our lot " +
        "with that supplier lot; if none was received yet, the document waits and is attached when it is"
    ),
  purchaseOrder: z
    .union([z.number().int(), z.string()])
    .optional()
    .describe("PO reference code the document was sent for (e.g. from the email subject), so receiving can show it"),
  issuedAt: dateArg.optional(),
  expiresAt: dateArg.optional().describe("Only if an expiry date is printed on the document, YYYY-MM-DD"),
  revision: z.string().optional().describe("Revision or version printed on the document"),
  basedOnDocumentId: z.string().optional().describe("For internal documents: the supplier document it was made from"),
};

type DetailsArgs = {
  documentType: string;
  issuer: "supplier" | "internal";
  supplier?: string;
  lot?: string;
  supplierLot?: string;
  purchaseOrder?: string | number;
  issuedAt?: string;
  expiresAt?: string;
  revision?: string;
  basedOnDocumentId?: string;
};

// Resolves the details of a new item document, or says what's wrong with them.
export const resolveDetails = async (itemId: string, args: DetailsArgs): Promise<{ details: ItemDocumentDetails } | { error: string }> => {
  const type = await resolveFileType(args.documentType);
  if ("error" in type) return { error: type.error! };
  const supplier = args.supplier ? await resolveSupplier(args.supplier) : null;
  if (supplier && "error" in supplier) return { error: supplier.error! };
  const lot = args.lot ? await resolveLot(itemId, args.lot) : null;
  if (lot && "error" in lot) return { error: lot.error! };
  const po = args.purchaseOrder !== undefined ? await resolvePurchaseOrder(args.purchaseOrder) : null;
  if (po && "error" in po) return { error: po.error! };

  if (args.basedOnDocumentId) {
    const source = await findDocument(args.basedOnDocumentId);
    if (args.issuer !== "internal") return { error: "Only internal documents can be based on another document." };
    if (!source || source.itemId !== itemId) return { error: "basedOnDocumentId must be a document of the same item." };
  }

  const details: ItemDocumentDetails = {
    fileTypeId: type.type!.id,
    issuer: args.issuer,
    supplierId: supplier?.supplier?.id ?? null,
    lotId: lot?.lot?.id ?? null,
    supplierLotNumber: args.supplierLot ?? null,
    purchaseOrderId: po?.purchaseOrder?.id ?? null,
    issuedAt: toDate(args.issuedAt) ?? null,
    expiresAt: toDate(args.expiresAt) ?? null,
    revision: args.revision ?? null,
    derivedFromId: args.basedOnDocumentId ?? null,
  };
  if (details.issuedAt && details.expiresAt && details.expiresAt <= details.issuedAt) {
    return { error: "expiresAt must be after issuedAt." };
  }
  return { details };
};

// What an agent needs to know after filing: which lot it landed on (or that it waits), what it replaced,
// other current versions it left alone, and the item's requirements for that document type.
export const describeFiling = async (
  itemId: string,
  documentId: string,
  details: ItemDocumentDetails,
  result: { lotId: string | null; replacedIds: string[]; filedAsOlderIds: string[] },
) => {
  const filedLot = result.lotId
    ? await prisma.lot.findUnique({ where: { id: result.lotId }, select: { lotNumber: true, supplierLotNumber: true } })
    : null;

  // current versions of the same document from another (or no) supplier that this didn't replace
  const otherCurrent = await prisma.itemFile.findMany({
    where: {
      itemId,
      id: { not: documentId },
      fileTypeId: details.fileTypeId,
      issuer: details.issuer,
      lotId: result.lotId,
      ...(result.lotId ? {} : { supplierLotNumber: details.supplierLotNumber ?? null }),
      supersededAt: null,
      // NULL never equals anything in SQL, so "different supplier" has to spell out the no-supplier case
      ...(details.supplierId
        ? { OR: [{ supplierId: null }, { supplierId: { not: details.supplierId } }] }
        : { supplierId: { not: null } }),
    },
    select: { id: true, file: { select: { name: true } }, supplier: { select: { name: true } } },
  });

  const after = await describeItemDocuments(itemId);
  return {
    documentId,
    lot: filedLot
      ? { lotNumber: filedLot.lotNumber, supplierLot: filedLot.supplierLotNumber, matchedBySupplierLot: !details.lotId }
      : details.supplierLotNumber
        ? `Waiting: no lot with supplier lot ${details.supplierLotNumber} has been received yet. It will be attached when one is.`
        : null,
    replaced: result.replacedIds,
    filedAsOlderVersion: result.filedAsOlderIds.length > 0
      ? "A newer version is already current, so this was filed as a replaced (older) version."
      : undefined,
    otherCurrentVersions: otherCurrent.map((d) => ({ documentId: d.id, name: d.file.name, supplier: d.supplier?.name ?? null })),
    requirements: after.requirements.filter((r) => r.documentTypeId === details.fileTypeId),
  };
};
