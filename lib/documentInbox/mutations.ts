import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createItemDocuments, ItemDocumentDetails } from "@/lib/itemDocuments/mutations";
import { InboxSuggestion } from "./types";

// Filing, dismissing and checking inbox documents, shared by the inbox page (server actions) and the
// MCP tools. A person's filing counts as checked; the agent's waits until someone checks it.

export type InboxActor = { userId: string; via: "user" | "agent" };

export class InboxError extends Error {}

const loadDocument = async (id: string) => {
  const doc = await prisma.inboxDocument.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      fileId: true,
      file: { select: { name: true } },
      filings: {
        select: {
          itemFile: { select: { itemId: true } },
          poAccountingFile: { select: { purchaseOrderId: true } },
        },
      },
    },
  });
  if (!doc) throw new InboxError("No inbox document with that id.");
  return doc;
};

// Filing a dismissed document brings it back; the dismissal no longer applies.
const markFiled = (actor: InboxActor) => ({
  status: "filed",
  dismissedAt: null,
  dismissedById: null,
  dismissReason: null,
  ...(actor.via === "user" ? { checkedAt: new Date(), checkedById: actor.userId } : {}),
});

const actorFor = (actor: InboxActor) => ({ userId: actor.userId, ...(actor.via === "agent" ? { via: "mcp" as const } : {}) });

export const fileInboxDocumentToItem = async (
  actor: InboxActor,
  inboxDocumentId: string,
  itemId: string,
  details: ItemDocumentDetails,
  options: { alsoReplace?: string[]; reason?: string | null } = {},
) => {
  const doc = await loadDocument(inboxDocumentId);
  if (doc.filings.some((f) => f.itemFile?.itemId === itemId)) throw new InboxError("This document is already filed on that item.");

  const result = await createItemDocuments(
    actorFor(actor),
    itemId,
    [{ fileId: doc.fileId, name: doc.file.name }],
    details,
    options.alsoReplace ?? [],
  );
  const itemFileId = result.itemFileIds[0];

  await prisma.$transaction([
    prisma.inboxFiling.create({
      data: {
        inboxDocumentId,
        itemFileId,
        replacedItemFileIds: result.replacedIds,
        via: actor.via,
        reason: options.reason?.trim() || null,
        filedById: actor.userId,
      },
    }),
    prisma.inboxDocument.update({ where: { id: inboxDocumentId }, data: markFiled(actor) }),
  ]);

  return { ...result, itemFileId };
};

export const fileInboxDocumentToPurchaseOrder = async (
  actor: InboxActor,
  inboxDocumentId: string,
  purchaseOrderId: string,
  fileTypeId: string,
  options: { reason?: string | null } = {},
) => {
  const doc = await loadDocument(inboxDocumentId);
  if (doc.filings.some((f) => f.poAccountingFile?.purchaseOrderId === purchaseOrderId)) {
    throw new InboxError("This document is already filed on that purchase order.");
  }

  const poFile = await prisma.$transaction(async (tx) => {
    const poFile = await tx.poAccountingFile.create({ data: { fileId: doc.fileId, purchaseOrderId, fileTypeId } });
    await tx.poAccountingAuditLog.create({
      data: {
        poId: purchaseOrderId,
        userId: actor.userId,
        action: "Add File",
        context: `${doc.file.name} was added from the document inbox${actor.via === "agent" ? " by an agent" : ""}.`,
      },
    });
    await tx.inboxFiling.create({
      data: {
        inboxDocumentId,
        poAccountingFileId: poFile.id,
        via: actor.via,
        reason: options.reason?.trim() || null,
        filedById: actor.userId,
      },
    });
    await tx.inboxDocument.update({ where: { id: inboxDocumentId }, data: markFiled(actor) });
    return poFile;
  });

  return { poAccountingFileId: poFile.id };
};

// Takes a filing back: removes the item document or PO file it created (the file stays in the inbox)
// and restores the documents it replaced. With no filings left the document is pending again.
export const undoInboxFiling = async (userId: string, filingId: string) => {
  const filing = await prisma.inboxFiling.findUnique({
    where: { id: filingId },
    select: {
      inboxDocumentId: true,
      replacedItemFileIds: true,
      inboxDocument: { select: { file: { select: { name: true } } } },
      itemFile: { select: { id: true, itemId: true } },
      poAccountingFile: { select: { id: true, purchaseOrderId: true } },
    },
  });
  if (!filing) throw new InboxError("That filing no longer exists.");
  const name = filing.inboxDocument.file.name;

  await prisma.$transaction(async (tx) => {
    if (filing.itemFile) {
      await tx.itemFile.delete({ where: { id: filing.itemFile.id } });
      if (filing.replacedItemFileIds.length > 0) {
        await tx.itemFile.updateMany({
          where: { id: { in: filing.replacedItemFileIds }, supersededAt: { not: null } },
          data: { supersededAt: null },
        });
      }
      await tx.activityLog.create({
        data: {
          userId,
          action: "removeFile",
          entityType: "item",
          entityId: filing.itemFile.itemId,
          details: { context: `Took back ${name}, filed from the document inbox` },
        },
      });
    }
    if (filing.poAccountingFile) {
      await tx.poAccountingFile.delete({ where: { id: filing.poAccountingFile.id } });
      await tx.poAccountingAuditLog.create({
        data: { poId: filing.poAccountingFile.purchaseOrderId, userId, action: "Remove File", context: `${name} was taken back to the document inbox.` },
      });
    }
    // deleting the item document or PO file cascades to the filing; one that lost both is removed here
    await tx.inboxFiling.deleteMany({ where: { id: filingId } });

    const left = await tx.inboxFiling.count({ where: { inboxDocumentId: filing.inboxDocumentId } });
    if (left === 0) {
      await tx.inboxDocument.update({
        where: { id: filing.inboxDocumentId },
        data: { status: "pending", checkedAt: null, checkedById: null },
      });
    }
  });
};

export const markInboxDocumentChecked = (userId: string, id: string) =>
  prisma.inboxDocument.update({ where: { id }, data: { checkedAt: new Date(), checkedById: userId } });

export const dismissInboxDocument = async (userId: string, id: string, reason: string) => {
  const doc = await loadDocument(id);
  if (doc.filings.length > 0) throw new InboxError("Take back its filings before dismissing it.");
  return prisma.inboxDocument.update({
    where: { id },
    data: { status: "dismissed", dismissedAt: new Date(), dismissedById: userId, dismissReason: reason.trim() || null },
  });
};

export const restoreInboxDocument = (id: string) =>
  prisma.inboxDocument.update({
    where: { id },
    data: { status: "pending", dismissedAt: null, dismissedById: null, dismissReason: null },
  });

export const saveInboxSuggestion = (id: string, suggestion: InboxSuggestion) =>
  prisma.inboxDocument.update({
    where: { id },
    data: { suggestion: suggestion as unknown as Prisma.InputJsonValue, suggestedAt: new Date() },
  });
