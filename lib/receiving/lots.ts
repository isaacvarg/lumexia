import prisma from "@/lib/prisma";
import { outOfSpecLotIds } from "@/lib/qcCoaImport/queries";
import { getFileUrl } from "@/actions/files/getUrl";
import { getItemDocumentStatus } from "@/lib/itemDocuments/queries";
import { cleanSupplierLot, sameSupplierLot } from "@/lib/itemDocuments/supplierLots";
import { failedChecks, CheckAnswers } from "./checks";
import { lineFlags, lotFlags } from "./flags";

export type LotSupplierDetails = {
  supplierLotNumber: string | null;
  expiresAt: Date | null;
  manufacturedAt: Date | null;
};

// Correcting what was captured at receiving (or filling it in for lots received before it was captured).
// Setting a supplier lot attaches documents that were waiting for it.
export const updateLotSupplierDetails = async (userId: string, lotId: string, details: LotSupplierDetails) => {
  const before = await prisma.lot.findUniqueOrThrow({ where: { id: lotId }, select: { itemId: true, lotNumber: true, supplierLotNumber: true } });
  const supplierLotNumber = cleanSupplierLot(details.supplierLotNumber);

  const lot = await prisma.lot.update({
    where: { id: lotId },
    data: { supplierLotNumber, expiresAt: details.expiresAt, manufacturedAt: details.manufacturedAt },
  });

  let linked = 0;
  if (supplierLotNumber && supplierLotNumber !== before.supplierLotNumber) {
    const waiting = await prisma.itemFile.findMany({
      where: { itemId: before.itemId, lotId: null, supersededAt: null, supplierLotNumber: { not: null } },
      select: { id: true, supplierLotNumber: true },
    });
    const matching = waiting.filter((w) => sameSupplierLot(w.supplierLotNumber!, supplierLotNumber)).map((w) => w.id);
    if (matching.length > 0) {
      linked = (await prisma.itemFile.updateMany({ where: { id: { in: matching } }, data: { lotId } })).count;
    }
  }

  const changes = [
    before.supplierLotNumber !== supplierLotNumber && `supplier lot ${supplierLotNumber ?? "cleared"}`,
    linked > 0 && `attached ${linked} waiting document${linked === 1 ? "" : "s"}`,
  ].filter(Boolean);
  await prisma.activityLog.create({
    data: {
      userId,
      action: "Lot Updated",
      entityType: "item",
      entityId: before.itemId,
      details: { context: `Lot ${before.lotNumber}: updated receiving details${changes.length ? ` (${changes.join(", ")})` : ""}` },
    },
  });

  return { lot, linked };
};

// How a received lot came in: the delivery, the inspection of its PO line, photos, and what needs a look.
export const getLotReceipt = async (lotId: string) => {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: {
      id: true,
      itemId: true,
      supplierLotNumber: true,
      receiptLine: {
        include: {
          receipt: { include: { receivedBy: { select: { name: true } }, purchaseOrder: { select: { id: true, referenceCode: true } } } },
          files: { include: { file: { select: { id: true, name: true, bucketName: true, objectName: true } } } },
        },
      },
    },
  });
  if (!lot?.receiptLine) return null;

  const line = lot.receiptLine;
  const status = await getItemDocumentStatus(prisma, lot.itemId);
  return {
    receivedAt: line.receipt.createdAt,
    receivedBy: line.receipt.receivedBy.name,
    purchaseOrder: line.receipt.purchaseOrder,
    packingSlipNumber: line.receipt.packingSlipNumber,
    carrier: line.receipt.carrier,
    failedChecks: failedChecks(line.checks as CheckAnswers).map((c) => c.label),
    issueNote: line.issueNote,
    photos: await Promise.all(line.files.map(async (f) => ({ id: f.file.id, name: f.file.name, url: await getFileUrl(f.file.bucketName, f.file.objectName) }))),
    flags: [...lineFlags(line), ...lotFlags({ ...lot, outOfSpec: (await outOfSpecLotIds(prisma, [lotId])).has(lotId) }, status?.requirements ?? [])],
  };
};

export type LotReceipt = NonNullable<Awaited<ReturnType<typeof getLotReceipt>>>;
