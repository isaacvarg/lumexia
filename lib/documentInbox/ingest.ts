import { createHash } from "crypto";
import { Buffer } from "buffer";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { storeUploadedFile } from "@/lib/files/storeUpload";
import { findSenderSupplier } from "./senderSupplier";
import { findOnFileByMd5 } from "./queries";
import { dismissReasons, INBOX_MAX_BYTES, inboxMimeTypes, InboxSource, InboxStatus } from "./types";

// Puts an incoming message and its files into the inbox. Safe to repeat: a message is keyed by its
// source id and a file by its checksum within the message, so a retried upload adds nothing twice.
// A file that's already filed somewhere, or that was dismissed before, comes in already dismissed.

export type InboxMessageInput = {
  source: InboxSource;
  sourceId: string;
  threadId?: string | null;
  sourceUrl?: string | null;
  senderEmail?: string | null;
  senderName?: string | null;
  subject?: string | null;
  body?: string | null;
  receivedAt?: Date | null;
};

export type InboxFileInput = { name: string; type: string; buffer: Buffer };

// keep enough of the email to identify the item and PO; quoted history beyond this rarely helps
const BODY_LIMIT = 20_000;

export const md5Hex = (buffer: Buffer) => createHash("md5").update(buffer).digest("hex");

// Browsers and n8n often send application/octet-stream; trust the extension then.
export const inboxMimeType = (name: string, type: string) => {
  const allowed = new Set(Object.values(inboxMimeTypes));
  if (allowed.has(type)) return type;
  const ext = name.toLowerCase().split(".").pop() ?? "";
  return inboxMimeTypes[ext] ?? null;
};

export const ingestInboxMessage = async (userId: string, input: InboxMessageInput, files: InboxFileInput[]) => {
  const meta = {
    threadId: input.threadId || null,
    sourceUrl: input.sourceUrl || null,
    senderEmail: input.senderEmail?.trim() || null,
    senderName: input.senderName?.trim() || null,
    subject: input.subject?.trim() || null,
    body: input.body ? input.body.slice(0, BODY_LIMIT) : null,
    receivedAt: input.receivedAt ?? null,
  };

  const key = { source_sourceId: { source: input.source, sourceId: input.sourceId } };
  const message =
    (await prisma.inboxMessage.findUnique({ where: key })) ??
    (await prisma.inboxMessage
      .create({
        data: {
          source: input.source,
          sourceId: input.sourceId,
          ...meta,
          supplierId: await findSenderSupplier(prisma, meta.senderEmail),
          createdById: userId,
        },
      })
      .catch(async (e) => {
        // two uploads of the same message at once: use the one that won
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          return prisma.inboxMessage.findUniqueOrThrow({ where: key });
        }
        throw e;
      }));

  const documents: {
    inboxDocumentId: string;
    name: string;
    md5: string;
    status: InboxStatus;
    dismissReason: string | null;
    alreadyInInbox: boolean;
  }[] = [];
  const skipped: { name: string; reason: string }[] = [];

  for (const f of files) {
    const type = inboxMimeType(f.name, f.type);
    if (!type) {
      skipped.push({ name: f.name, reason: "Only PDFs, images and Office/CSV files are accepted." });
      continue;
    }
    if (f.buffer.length > INBOX_MAX_BYTES) {
      skipped.push({ name: f.name, reason: "Files can be at most 50 MB." });
      continue;
    }

    const md5 = md5Hex(f.buffer);
    const existing = await prisma.inboxDocument.findUnique({
      where: { messageId_md5: { messageId: message.id, md5 } },
      select: { id: true, status: true, dismissReason: true },
    });
    if (existing) {
      documents.push({ inboxDocumentId: existing.id, name: f.name, md5, status: existing.status as InboxStatus, dismissReason: existing.dismissReason, alreadyInInbox: true });
      continue;
    }

    const [onFile, dismissedBefore] = await Promise.all([
      findOnFileByMd5(prisma, [md5]),
      prisma.inboxDocument.findFirst({ where: { md5, status: "dismissed" }, select: { id: true } }),
    ]);
    const dismissReason = onFile.has(md5) ? dismissReasons.alreadyFiled : dismissedBefore ? dismissReasons.dismissedBefore : null;

    const stored = await storeUploadedFile({
      file: { name: f.name, type, size: f.buffer.length },
      buffer: f.buffer,
      pathPrefix: "inbox",
      uploadedById: userId,
    });

    try {
      const doc = await prisma.inboxDocument.create({
        data: {
          messageId: message.id,
          fileId: stored.fileId,
          md5,
          ...(dismissReason ? { status: "dismissed", dismissedAt: new Date(), dismissReason } : {}),
        },
        select: { id: true, status: true },
      });
      documents.push({ inboxDocumentId: doc.id, name: f.name, md5, status: doc.status as InboxStatus, dismissReason, alreadyInInbox: false });
    } catch (e) {
      // the same file in the same message arrived twice at once; keep the first
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
      await prisma.file.delete({ where: { id: stored.fileId } }).catch(() => undefined);
      const winner = await prisma.inboxDocument.findUniqueOrThrow({ where: { messageId_md5: { messageId: message.id, md5 } } });
      documents.push({ inboxDocumentId: winner.id, name: f.name, md5, status: winner.status as InboxStatus, dismissReason: winner.dismissReason, alreadyInInbox: true });
    }
  }

  const supplier = message.supplierId
    ? await prisma.supplier.findUnique({ where: { id: message.supplierId }, select: { id: true, name: true } })
    : null;

  return { messageId: message.id, supplier, documents, skipped };
};
