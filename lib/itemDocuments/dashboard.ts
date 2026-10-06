import { Db } from "@/lib/canon/db";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { getItemDocumentStatuses, ItemDocumentStatus } from "./queries";
import { RequirementStatus } from "./types";

// Statuses that put a required document on the dashboard; "current" and "notApplicable" don't.
export const attentionStatuses: RequirementStatus[] = ["missing", "expired", "stale", "undated", "expiring"];

// Where an issue's supplier came from: the document on file, the lot's purchase order, or (for a missing
// item-level document) the supplier the item was most recently ordered from.
export type SupplierSource = "document" | "lot" | "purchaseHistory";

export type DocumentIssue = {
  key: string;
  itemId: string;
  itemTypeId: string;
  fileTypeId: string;
  requirementId: string;
  issuer: string;
  scope: string;
  status: RequirementStatus;
  lotId: string | null;
  documentId: string | null;
  expiresAt: Date | null;
  supplierId: string | null;
  supplierSource: SupplierSource | null;
};

type Context = {
  // supplier on each current document
  documentSuppliers: Map<string, string | null>;
  // purchase order supplier of each received lot
  lotSuppliers: Map<string, string>;
  // most recent purchase order supplier per item
  lastSuppliers: Map<string, string>;
};

const supplierFor = (
  issuer: string,
  documentId: string | null,
  lotId: string | null,
  itemId: string,
  ctx: Context
): { supplierId: string | null; supplierSource: SupplierSource | null } => {
  if (issuer === "internal") return { supplierId: null, supplierSource: null };
  const fromDocument = documentId ? ctx.documentSuppliers.get(documentId) : null;
  if (fromDocument) return { supplierId: fromDocument, supplierSource: "document" };
  const fromLot = lotId ? ctx.lotSuppliers.get(lotId) : undefined;
  if (fromLot) return { supplierId: fromLot, supplierSource: "lot" };
  if (!lotId) {
    const fromHistory = ctx.lastSuppliers.get(itemId);
    if (fromHistory) return { supplierId: fromHistory, supplierSource: "purchaseHistory" };
  }
  return { supplierId: null, supplierSource: null };
};

// One issue per required item-level document, or per counted lot for lot-level ones, that needs attention.
export const buildDocumentIssues = (
  statuses: (ItemDocumentStatus & { itemTypeId: string })[],
  ctx: Context
): DocumentIssue[] => {
  const issues: DocumentIssue[] = [];
  for (const item of statuses) {
    for (const r of item.requirements) {
      if (r.requirement.level !== "required") continue;
      const base = {
        itemId: item.itemId,
        itemTypeId: item.itemTypeId,
        fileTypeId: r.requirement.fileTypeId,
        requirementId: r.requirement.id,
        issuer: r.requirement.issuer,
        scope: r.requirement.scope,
      };

      if (r.lots) {
        for (const lot of r.lots) {
          if (!lot.counted || !attentionStatuses.includes(lot.status)) continue;
          const doc = lot.documents[0] ?? null;
          issues.push({
            ...base,
            key: `${item.itemId}:${r.requirement.id}:${lot.lotId}`,
            status: lot.status,
            lotId: lot.lotId,
            documentId: doc?.documentId ?? null,
            expiresAt: doc?.effectiveExpiresAt ?? null,
            ...supplierFor(r.requirement.issuer, doc?.documentId ?? null, lot.lotId, item.itemId, ctx),
          });
        }
        continue;
      }

      if (!attentionStatuses.includes(r.status)) continue;
      const doc = r.documents[0] ?? null;
      issues.push({
        ...base,
        key: `${item.itemId}:${r.requirement.id}`,
        status: r.status,
        lotId: null,
        documentId: doc?.documentId ?? null,
        expiresAt: doc?.effectiveExpiresAt ?? null,
        ...supplierFor(r.requirement.issuer, doc?.documentId ?? null, null, item.itemId, ctx),
      });
    }
  }
  return issues;
};

export const getDocumentDashboard = async (db: Db, now: Date = new Date()) => {
  const statuses = await getItemDocumentStatuses(db, { recordStatusId: { not: recordStatuses.archived } }, now);
  const withRequirements = statuses.filter((s) => s.requirements.some((r) => r.requirement.level === "required"));
  const itemIds = withRequirements.map((s) => s.itemId);

  const [items, files, lots, orders] = await Promise.all([
    db.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, referenceCode: true, itemTypeId: true, itemType: { select: { name: true } } },
    }),
    db.itemFile.findMany({
      where: { itemId: { in: itemIds }, supersededAt: null },
      select: { id: true, supplierId: true, file: { select: { name: true } } },
    }),
    db.lot.findMany({
      where: { itemId: { in: itemIds } },
      select: { id: true, lotNumber: true, lotOrigin: { select: { purchaseOrder: { select: { supplierId: true } } } } },
    }),
    db.purchaseOrderItem.findMany({
      where: { itemId: { in: itemIds } },
      select: { itemId: true, purchaseOrders: { select: { createdAt: true, supplierId: true } } },
    }),
  ]);

  const lastSuppliers = new Map<string, { supplierId: string; at: Date }>();
  for (const o of orders) {
    const last = lastSuppliers.get(o.itemId);
    if (!last || o.purchaseOrders.createdAt > last.at) {
      lastSuppliers.set(o.itemId, { supplierId: o.purchaseOrders.supplierId, at: o.purchaseOrders.createdAt });
    }
  }

  const itemTypeOf = new Map(items.map((i) => [i.id, i.itemTypeId]));
  const issues = buildDocumentIssues(
    withRequirements.map((s) => ({ ...s, itemTypeId: itemTypeOf.get(s.itemId) ?? "" })),
    {
      documentSuppliers: new Map(files.map((f) => [f.id, f.supplierId])),
      lotSuppliers: new Map(
        lots.flatMap((l) => (l.lotOrigin?.purchaseOrder ? [[l.id, l.lotOrigin.purchaseOrder.supplierId] as const] : []))
      ),
      lastSuppliers: new Map(Array.from(lastSuppliers, ([itemId, v]) => [itemId, v.supplierId])),
    }
  );

  const supplierIds = Array.from(new Set(issues.map((i) => i.supplierId).filter((id): id is string => !!id)));
  const fileTypeIds = Array.from(new Set(issues.map((i) => i.fileTypeId)));
  const [suppliers, fileTypes] = await Promise.all([
    db.supplier.findMany({ where: { id: { in: supplierIds } }, select: { id: true, name: true } }),
    db.itemFileType.findMany({
      where: { id: { in: fileTypeIds } },
      select: { id: true, name: true, abbreviaton: true, bgColor: true, textColor: true },
    }),
  ]);

  const itemsWithIssues = new Set(issues.map((i) => i.itemId));
  const issueLots = new Set(issues.map((i) => i.lotId));
  const issueDocuments = new Set(issues.map((i) => i.documentId));
  const countBy = (status: RequirementStatus) => issues.filter((i) => i.status === status).length;

  return {
    summary: {
      items: withRequirements.length,
      itemsInOrder: withRequirements.length - itemsWithIssues.size,
      missing: countBy("missing"),
      expired: countBy("expired"),
      expiring: countBy("expiring"),
      review: countBy("stale") + countBy("undated"),
    },
    issues,
    items: items.map((i) => ({ id: i.id, name: i.name, referenceCode: i.referenceCode, itemTypeId: i.itemTypeId, itemTypeName: i.itemType.name })),
    lots: lots.filter((l) => issueLots.has(l.id)).map((l) => ({ id: l.id, lotNumber: l.lotNumber })),
    documents: files.filter((f) => issueDocuments.has(f.id)).map((f) => ({ id: f.id, name: f.file.name })),
    suppliers,
    fileTypes,
  };
};

export type DocumentDashboard = Awaited<ReturnType<typeof getDocumentDashboard>>;
