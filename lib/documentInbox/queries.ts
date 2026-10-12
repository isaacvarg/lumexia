import { Prisma } from "@prisma/client";
import { Db } from "@/lib/canon/db";
import { slugify } from "@/utils/slug";
import { InboxSuggestion, InboxView } from "./types";

// A filed document whose filings were all removed (its item document was deleted) is back to pending.
const unfiled: Prisma.InboxDocumentWhereInput = { OR: [{ status: "pending" }, { status: "filed", filings: { none: {} } }] };
const agentFiled: Prisma.InboxDocumentWhereInput = { status: "filed", checkedAt: null, filings: { some: {} } };

export const inboxViewWhere = (view: InboxView): Prisma.InboxDocumentWhereInput => {
  switch (view) {
    case "review":
      return { OR: [unfiled, agentFiled] };
    case "pending":
      return unfiled;
    case "agentFiled":
      return agentFiled;
    case "filed":
      return { status: "filed", filings: { some: {} } };
    case "dismissed":
      return { status: "dismissed" };
  }
};

export const getInboxCounts = async (db: Db) => {
  const [pending, agent, filed, dismissed] = await Promise.all([
    db.inboxDocument.count({ where: inboxViewWhere("pending") }),
    db.inboxDocument.count({ where: inboxViewWhere("agentFiled") }),
    db.inboxDocument.count({ where: inboxViewWhere("filed") }),
    db.inboxDocument.count({ where: inboxViewWhere("dismissed") }),
  ]);
  return { review: pending + agent, pending, agentFiled: agent, filed, dismissed };
};

export const itemDocumentsHref = (item: { id: string; name: string }) =>
  `/inventory/items/${slugify(item.name)}?id=${item.id}&tab=files`;
export const purchaseOrderHref = (po: { id: string; referenceCode: number }) =>
  `/purchasing/purchase-orders/${po.referenceCode}?id=${po.id}`;

// Where files with these checksums are already filed (as an item document or PO file), by md5.
// S3 etags of single-part uploads are the MD5, sometimes quoted.
export const findOnFileByMd5 = async (db: Db, md5s: string[]) => {
  const wanted = Array.from(new Set(md5s.map((m) => m.toLowerCase())));
  const files = wanted.length === 0 ? [] : await db.file.findMany({
    where: {
      etag: { in: wanted.flatMap((m) => [m, `"${m}"`]) },
      OR: [{ itemFiles: { some: {} } }, { poAccountingFiles: { some: {} } }],
    },
    select: {
      etag: true,
      itemFiles: {
        select: {
          id: true,
          supersededAt: true,
          item: { select: { id: true, name: true, referenceCode: true } },
          fileType: { select: { name: true } },
        },
      },
      poAccountingFiles: { select: { id: true, purchaseOrder: { select: { id: true, referenceCode: true } } } },
    },
  });

  const byMd5 = new Map<string, { kind: "item" | "purchaseOrder"; id: string; label: string; href: string }[]>();
  for (const f of files) {
    const md5 = f.etag.replace(/"/g, "").toLowerCase();
    const list = byMd5.get(md5) ?? [];
    for (const d of f.itemFiles) {
      list.push({
        kind: "item",
        id: d.id,
        label: `${d.fileType.name} on ${d.item.name}${d.supersededAt ? " (replaced)" : ""}`,
        href: itemDocumentsHref(d.item),
      });
    }
    for (const p of f.poAccountingFiles) {
      list.push({ kind: "purchaseOrder", id: p.id, label: `PO #${p.purchaseOrder.referenceCode}`, href: purchaseOrderHref(p.purchaseOrder) });
    }
    byMd5.set(md5, list);
  }
  return byMd5;
};

const documentSelect = {
  id: true,
  md5: true,
  status: true,
  suggestion: true,
  suggestedAt: true,
  checkedAt: true,
  dismissedAt: true,
  dismissReason: true,
  createdAt: true,
  checkedBy: { select: { name: true } },
  dismissedBy: { select: { name: true } },
  file: {
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      bucketName: true,
      objectName: true,
      thumbnailBucketName: true,
      thumbnailObjectName: true,
    },
  },
  filings: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      via: true,
      reason: true,
      createdAt: true,
      filedBy: { select: { name: true } },
      itemFile: {
        select: {
          id: true,
          supersededAt: true,
          supplierLotNumber: true,
          item: { select: { id: true, name: true, referenceCode: true } },
          fileType: { select: { name: true, bgColor: true, textColor: true } },
          lot: { select: { lotNumber: true } },
        },
      },
      poAccountingFile: {
        select: {
          id: true,
          fileType: { select: { name: true } },
          purchaseOrder: { select: { id: true, referenceCode: true, supplier: { select: { name: true } } } },
        },
      },
    },
  },
  message: {
    select: {
      id: true,
      source: true,
      sourceId: true,
      threadId: true,
      sourceUrl: true,
      senderEmail: true,
      senderName: true,
      subject: true,
      body: true,
      receivedAt: true,
      createdAt: true,
      supplier: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.InboxDocumentSelect;

export type InboxDocumentRow = Prisma.InboxDocumentGetPayload<{ select: typeof documentSelect }>;

// Newest messages first; documents of one message stay together.
export const listInboxDocuments = async (db: Db, view: InboxView, limit = 200) => {
  const rows = await db.inboxDocument.findMany({
    where: inboxViewWhere(view),
    select: documentSelect,
    orderBy: [{ message: { receivedAt: { sort: "desc", nulls: "last" } } }, { message: { createdAt: "desc" } }, { messageId: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
  return rows;
};

export const getInboxDocument = (db: Db, id: string) =>
  db.inboxDocument.findUnique({ where: { id }, select: documentSelect });

// Where a document stands, folding in filings that were removed afterwards.
export const effectiveStatus = (d: { status: string; checkedAt: Date | null; filings: unknown[] }) =>
  d.status === "dismissed"
    ? "dismissed"
    : d.status === "filed" && d.filings.length > 0
      ? d.checkedAt ? "filed" : "agentFiled"
      : "pending";

export const readSuggestion = (value: Prisma.JsonValue | null) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as unknown as InboxSuggestion) : null;
