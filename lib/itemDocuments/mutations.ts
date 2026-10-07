import prisma from "@/lib/prisma";
import { supersedeOlderItemFiles } from "./supersede";
import { DocumentIssuer } from "./types";

// Creating, editing and replacing item documents, shared by the Files tab (server actions) and the
// MCP tools. Callers pass the acting user, so activity is logged to the right person either way.

export type ItemDocumentDetails = {
  fileTypeId: string;
  issuer: DocumentIssuer;
  supplierId: string | null;
  lotId: string | null;
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
  const created = await prisma.$transaction(async (tx) => {
    const created = await Promise.all(
      files.map((f) => tx.itemFile.create({ data: { itemId, fileId: f.fileId, ...clean(details) } }))
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
    itemFileIds: Array.from(createdIds),
    replacedIds: superseded.filter((f) => !createdIds.has(f.id)).map((f) => f.id),
    filedAsOlderIds: superseded.filter((f) => createdIds.has(f.id)).map((f) => f.id),
  };
};

// Editing details never replaces other files automatically; use setItemDocumentReplaced for that.
export const updateItemDocument = async (actor: Actor, itemFileId: string, details: ItemDocumentDetails) => {
  const file = await prisma.itemFile.update({
    where: { id: itemFileId },
    data: clean(details),
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
