import prisma from "@/lib/prisma";
import { getFileUrl } from "@/actions/files/getUrl";
import { getItemDocumentStatuses } from "@/lib/itemDocuments/queries";
import { findWaitingDocuments } from "@/lib/itemDocuments/mutations";
import { EvaluatedRequirement } from "@/lib/itemDocuments/types";
import { itemDocumentGaps, lineFlags, lotFlags, lotRequirementStatuses, receivedLotRequirements } from "./flags";

type FileRow = { id: string; name: string; mimeType: string; bucketName: string; objectName: string };
const withUrl = async (f: FileRow) => ({ id: f.id, name: f.name, mimeType: f.mimeType, url: await getFileUrl(f.bucketName, f.objectName) });
const fileSelect = { id: true, name: true, mimeType: true, bucketName: true, objectName: true } as const;

// What the receiving screen needs per item on the purchase order: the document requirements a newly
// received lot will be checked against, item-level documents that need attention, and documents already
// on file waiting for a supplier lot (emailed ahead of the delivery, for instance).
const getItemExpectations = async (itemIds: string[], requirementsByItem: Map<string, EvaluatedRequirement[]>, purchaseOrderId: string) =>
  Promise.all(
    itemIds.map(async (itemId) => {
      const requirements = requirementsByItem.get(itemId) ?? [];
      const waiting = await findWaitingDocuments(prisma, itemId);
      const files = await prisma.file.findMany({ where: { id: { in: waiting.map((w) => w.file.id) } }, select: fileSelect });
      const urls = new Map(await Promise.all(files.map(async (f) => [f.id, (await withUrl(f)).url] as const)));
      return {
        itemId,
        lotRequirements: receivedLotRequirements(requirements).map((r) => ({ id: r.id, fileTypeId: r.fileTypeId, level: r.level, notes: r.notes })),
        itemGaps: itemDocumentGaps(requirements).map((r) => ({
          requirementId: r.requirement.id,
          fileTypeId: r.requirement.fileTypeId,
          level: r.requirement.level,
          status: r.status,
        })),
        waitingDocuments: waiting.map((w) => ({
          id: w.id,
          fileTypeId: w.fileTypeId,
          supplierLotNumber: w.supplierLotNumber!,
          forThisOrder: w.purchaseOrderId === purchaseOrderId,
          issuedAt: w.issuedAt,
          supplier: w.supplier,
          file: { name: w.file.name, mimeType: w.file.mimeType, url: urls.get(w.file.id) ?? null },
        })),
      };
    })
  );

export const getReceivingData = async (purchaseOrderId: string) => {
  const [rows, receipts, fileTypes] = await Promise.all([
    prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId }, select: { itemId: true } }),
    prisma.receipt.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: "desc" },
      include: {
        receivedBy: { select: { id: true, name: true } },
        files: { include: { file: { select: fileSelect } } },
        lines: {
          orderBy: { createdAt: "asc" },
          include: {
            purchaseOrderItem: { select: { item: { select: { id: true, name: true, referenceCode: true } }, uom: { select: { abbreviation: true } } } },
            lots: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                lotNumber: true,
                supplierLotNumber: true,
                expiresAt: true,
                manufacturedAt: true,
                initialQuantity: true,
                uom: { select: { abbreviation: true } },
                purchaseOrderItem: { select: { id: true, quantity: true } },
              },
            },
          },
        },
      },
    }),
    prisma.itemFileType.findMany({ select: { id: true, name: true, abbreviaton: true, bgColor: true, textColor: true }, orderBy: { name: "asc" } }),
  ]);

  const itemIds = Array.from(new Set([...rows.map((r) => r.itemId), ...receipts.flatMap((r) => r.lines.map((l) => l.purchaseOrderItem.item.id))]));
  const statuses = await getItemDocumentStatuses(prisma, { id: { in: itemIds } });
  const requirementsByItem = new Map(statuses.map((s) => [s.itemId, s.requirements]));

  const expectations = await getItemExpectations(Array.from(new Set(rows.map((r) => r.itemId))), requirementsByItem, purchaseOrderId);

  const receiptViews = await Promise.all(
    receipts.map(async (receipt) => ({
      id: receipt.id,
      createdAt: receipt.createdAt,
      receivedBy: receipt.receivedBy,
      packingSlipNumber: receipt.packingSlipNumber,
      carrier: receipt.carrier,
      notes: receipt.notes,
      packingSlips: await Promise.all(receipt.files.filter((f) => f.kind === "packingSlip").map((f) => withUrl(f.file))),
      lines: await Promise.all(
        receipt.lines.map(async (line) => {
          const requirements = requirementsByItem.get(line.purchaseOrderItem.item.id) ?? [];
          return {
            id: line.id,
            item: line.purchaseOrderItem.item,
            uom: line.purchaseOrderItem.uom.abbreviation,
            openQuantity: line.openQuantity,
            receivedQuantity: line.receivedQuantity,
            checks: line.checks as Record<string, string>,
            issueNote: line.issueNote,
            flags: lineFlags(line),
            photos: await Promise.all(receipt.files.filter((f) => f.receiptLineId === line.id).map((f) => withUrl(f.file))),
            lots: line.lots.map((lot) => ({
              id: lot.id,
              lotNumber: lot.lotNumber,
              supplierLotNumber: lot.supplierLotNumber,
              expiresAt: lot.expiresAt,
              manufacturedAt: lot.manufacturedAt,
              purchaseOrderItemId: lot.purchaseOrderItem?.id ?? null,
              quantity: lot.purchaseOrderItem?.quantity ?? null,
              initialQuantity: lot.initialQuantity,
              inventoryUom: lot.uom.abbreviation,
              flags: lotFlags(lot, requirements),
              documents: lotRequirementStatuses(requirements, lot.id).map((s) => ({ fileTypeId: s.requirement.fileTypeId, level: s.requirement.level, status: s.status })),
            })),
          };
        })
      ),
    }))
  );

  return { fileTypes, expectations, receipts: receiptViews };
};

export type ReceivingData = Awaited<ReturnType<typeof getReceivingData>>;
export type ItemExpectations = ReceivingData["expectations"][number];
export type WaitingDocument = ItemExpectations["waitingDocuments"][number];
export type ReceiptView = ReceivingData["receipts"][number];
export type ReceivingFileType = ReceivingData["fileTypes"][number];
