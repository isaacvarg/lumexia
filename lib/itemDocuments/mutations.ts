import prisma from "@/lib/prisma";
import { Db } from "@/lib/canon/db";
import { supersedeOlderItemFiles } from "./supersede";
import { cleanSupplierLot, sameSupplierLot } from "./supplierLots";
import { DocumentIssuer } from "./types";

// Creating, editing and replacing item documents, shared by the Files tab (server actions) and the
// MCP tools. Callers pass the acting user, so activity is logged to the right person either way.

export type ItemDocumentDetails = {
  fileTypeId: string;
  issuer: DocumentIssuer;
  supplierId: string | null;
  lotId: string | null;
  // the lot printed on the document; with no lotId, the document waits for a lot with this supplier lot
  supplierLotNumber?: string | null;
  purchaseOrderId?: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  revision: string | null;
  derivedFromId: string | null;
};

type Actor = { userId: string; via?: "mcp" };

const clean = (d: ItemDocumentDetails) => ({
  fileTypeId: d.fileTypeId,
  issuer: d.issuer === "internal" ? "internal" : "supplier",
  supplierId: d.supplierId || null,
  lotId: d.lotId || null,
  supplierLotNumber: cleanSupplierLot(d.supplierLotNumber),
  purchaseOrderId: d.purchaseOrderId || null,
  issuedAt: d.issuedAt,
  expiresAt: d.expiresAt,
  revision: d.revision?.trim() || null,
  // only our own documents are based on another one
  derivedFromId: d.issuer === "internal" ? d.derivedFromId || null : null,
});

const log = (actor: Actor, action: string, itemId: string, context: string) =>
  prisma.activityLog.create({
    data: {
      userId: actor.userId,
      action,
      entityType: "item",
      entityId: itemId,
      details: actor.via ? { context, via: actor.via } : { context },
    },
  });

// The item's lot with this supplier lot, when exactly one has it.
export const findLotBySupplierLot = async (db: Db, itemId: string, supplierLot: string | null | undefined) => {
  if (!cleanSupplierLot(supplierLot)) return null;
  const lots = await db.lot.findMany({
    where: { itemId, supplierLotNumber: { not: null } },
    select: { id: true, lotNumber: true, supplierLotNumber: true },
  });
  const matches = lots.filter((l) => sameSupplierLot(l.supplierLotNumber!, supplierLot!));
  return matches.length === 1 ? matches[0] : null;
};

// A document that names a supplier lot but no lot goes to our lot with that supplier lot, if there is one.
const withMatchedLot = async (db: Db, itemId: string, details: ItemDocumentDetails): Promise<ItemDocumentDetails> => {
  if (details.lotId || !details.supplierLotNumber) return details;
  const lot = await findLotBySupplierLot(db, itemId, details.supplierLotNumber);
  return lot ? { ...details, lotId: lot.id } : details;
};

// Documents that arrived before their lot (no lot, a supplier lot printed on them): the current ones that
// match a lot's supplier lot. Used when receiving to show what's already on file.
export const findWaitingDocuments = async (db: Db, itemId: string) =>
  db.itemFile.findMany({
    where: { itemId, lotId: null, supersededAt: null, supplierLotNumber: { not: null } },
    select: {
      id: true,
      fileTypeId: true,
      issuer: true,
      supplierLotNumber: true,
      purchaseOrderId: true,
      issuedAt: true,
      createdAt: true,
      file: { select: { id: true, name: true, mimeType: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

// Files uploaded together share their details; each replaces older current versions of the same document.
// `alsoReplace` are current files the uploader chose to replace even though their supplier differs.
// Returns the new item file ids, the existing files this replaced, and any new file that was filed as an
// older version because a newer one is already current.
export const createItemDocuments = async (
  actor: Actor,
  itemId: string,
  files: { fileId: string; name: string }[],
  details: ItemDocumentDetails,
  alsoReplace: string[] = []
) => {
  const startedAt = new Date();
  const matched = await withMatchedLot(prisma, itemId, details);
  const created = await prisma.$transaction(async (tx) => {
    const created = await Promise.all(
      files.map((f) => tx.itemFile.create({ data: { itemId, fileId: f.fileId, ...clean(matched) } }))
    );
    const batchIds = created.map((c) => c.id);
    for (const id of batchIds) {
      await supersedeOlderItemFiles(tx, id, { batchIds, now: startedAt });
    }
    if (alsoReplace.length > 0) {
      await tx.itemFile.updateMany({
        where: { id: { in: alsoReplace }, itemId, supersededAt: null },
        data: { supersededAt: startedAt },
      });
    }
    return created;
  });

  const createdIds = new Set(created.map((c) => c.id));
  const superseded = await prisma.itemFile.findMany({
    where: { itemId, supersededAt: startedAt },
    select: { id: true },
  });

  const context = files.length === 1 ? `Uploaded file ${files[0].name}` : `Uploaded ${files.length} files`;
  await log(actor, "uploadFile", itemId, context);

  return {
    lotId: matched.lotId,
    itemFileIds: Array.from(createdIds),
    replacedIds: superseded.filter((f) => !createdIds.has(f.id)).map((f) => f.id),
    filedAsOlderIds: superseded.filter((f) => createdIds.has(f.id)).map((f) => f.id),
  };
};

// Editing details never replaces other files automatically; use setItemDocumentReplaced for that.
export const updateItemDocument = async (actor: Actor, itemFileId: string, details: ItemDocumentDetails) => {
  const { itemId } = await prisma.itemFile.findUniqueOrThrow({ where: { id: itemFileId }, select: { itemId: true } });
  const file = await prisma.itemFile.update({
    where: { id: itemFileId },
    data: clean(await withMatchedLot(prisma, itemId, details)),
    include: { file: { select: { name: true } } },
  });
  await log(actor, "updateFile", file.itemId, `Updated details of ${file.file.name}`);
  return file;
};

export const setItemDocumentReplaced = async (actor: Actor, itemFileId: string, replaced: boolean) => {
  const file = await prisma.itemFile.update({
    where: { id: itemFileId },
    data: { supersededAt: replaced ? new Date() : null },
    include: { file: { select: { name: true } } },
  });
  await log(
    actor,
    "updateFile",
    file.itemId,
    replaced ? `Marked ${file.file.name} as replaced` : `Restored ${file.file.name} as current`
  );
  return file;
};
