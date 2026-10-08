import prisma from "@/lib/prisma";
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses";
import { generateLotNumber } from "@/utils/lot/generateLotNumber";
import { uomUtils } from "@/utils/uom";
import { UomConversionError } from "@/utils/uom/conversionError";
import { supersedeOlderItemFiles } from "@/lib/itemDocuments/supersede";
import { cleanSupplierLot } from "@/lib/itemDocuments/supplierLots";
import { CheckAnswers, failedChecks, receivingChecks, unansweredChecks } from "./checks";
import { planLine } from "./plan";

// Receiving a delivery against a purchase order: one receipt, one receipt line per PO line in the delivery,
// and one lot of ours per supplier lot. A PO line holding several supplier lots is split into one PO row
// per lot (each row keeps exactly one lot); anything not delivered stays open on a remainder row.

export type ReceiveLotInput = {
  supplierLotNumber: string | null;
  // in the PO line's (purchase) unit
  quantity: number;
  expiresAt: Date | null;
  manufacturedAt: Date | null;
  // documents already on file, waiting for this supplier lot, to attach to the new lot
  linkDocumentIds: string[];
};

export type ReceiveDocumentInput = {
  fileId: string;
  name: string;
  fileTypeId: string;
  // index into the line's lots; null for an item-level document (e.g. SDS)
  lotIndex: number | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
};

export type ReceiveLineInput = {
  purchaseOrderItemId: string;
  checks: CheckAnswers;
  issueNote: string | null;
  photoFileIds: string[];
  lots: ReceiveLotInput[];
  documents: ReceiveDocumentInput[];
};

export type ReceiveInput = {
  purchaseOrderId: string;
  packingSlipNumber: string | null;
  carrier: string | null;
  notes: string | null;
  packingSlipFileIds: string[];
  lines: ReceiveLineInput[];
};

export type ReceiveResult =
  | {
      ok: true;
      receiptId: string;
      lotIds: string[];
      // for follow-ups outside the transaction: connected requests and the pricing queue
      items: { itemId: string; stillExpected: boolean; triggersPricing: boolean }[];
    }
  | { ok: false; error: string; purchaseOrderItemId?: string };

const receivableStatuses: string[] = [purchaseOrderStatuses.confirmedAwaitingDelivery, purchaseOrderStatuses.partiallyReceived];

const validate = (input: ReceiveInput): string | null => {
  if (input.lines.length === 0) return "Choose at least one line to receive.";
  for (const line of input.lines) {
    if (line.lots.length === 0) return "Every line needs at least one lot.";
    if (line.lots.some((l) => !(l.quantity > 0))) return "Every lot needs a quantity above zero.";
    if (unansweredChecks(line.checks).length > 0) return "Answer every inspection check.";
    if (Object.keys(line.checks).some((k) => !receivingChecks.some((c) => c.key === k))) return "Unknown inspection check.";
    if (failedChecks(line.checks).length > 0 && !line.issueNote?.trim()) return "Describe what failed inspection.";
    if (line.documents.some((d) => d.lotIndex !== null && !line.lots[d.lotIndex])) return "A document points at a lot that isn't there.";
  }
  return null;
};

export const receiveDelivery = async (userId: string, input: ReceiveInput): Promise<ReceiveResult> => {
  const problem = validate(input);
  if (problem) return { ok: false, error: problem };

  const poItems = await prisma.purchaseOrderItem.findMany({
    where: { id: { in: input.lines.map((l) => l.purchaseOrderItemId) }, purchaseOrderId: input.purchaseOrderId },
    include: {
      item: { include: { inventoryUom: true, itemType: { include: { config: true } } } },
      uom: true,
      details: true,
      purchaseOrders: { select: { id: true, referenceCode: true, supplierId: true, statusId: true } },
    },
  });
  const byId = new Map(poItems.map((p) => [p.id, p]));

  for (const line of input.lines) {
    const poItem = byId.get(line.purchaseOrderItemId);
    if (!poItem) return { ok: false, error: "That line isn't on this purchase order.", purchaseOrderItemId: line.purchaseOrderItemId };
    if (!receivableStatuses.includes(poItem.purchaseOrderStatusId)) {
      return { ok: false, error: `${poItem.item.name} was already received. Refresh the page.`, purchaseOrderItemId: poItem.id };
    }
  }

  // unit conversion reads the database, so it runs before the transaction
  const converted = new Map<string, number[]>();
  for (const line of input.lines) {
    const poItem = byId.get(line.purchaseOrderItemId)!;
    const same = poItem.uomId === poItem.item.inventoryUomId;
    try {
      converted.set(
        line.purchaseOrderItemId,
        await Promise.all(
          line.lots.map((l) =>
            same
              ? l.quantity
              : uomUtils.convert(
                  { id: poItem.uomId, isStandard: poItem.uom.isStandardUom },
                  l.quantity,
                  { id: poItem.item.inventoryUomId, isStandard: poItem.item.inventoryUom.isStandardUom },
                  poItem.itemId,
                  poItem.purchaseOrders.supplierId
                )
          )
        )
      );
    } catch (error) {
      const message = error instanceof UomConversionError || error instanceof Error ? error.message : "Unit conversion failed.";
      return { ok: false, error: `${poItem.item.name}: ${message}`, purchaseOrderItemId: poItem.id };
    }
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const receipt = await tx.receipt.create({
      data: {
        purchaseOrderId: input.purchaseOrderId,
        receivedById: userId,
        packingSlipNumber: input.packingSlipNumber?.trim() || null,
        carrier: input.carrier?.trim() || null,
        notes: input.notes?.trim() || null,
        files: { create: input.packingSlipFileIds.map((fileId) => ({ fileId, kind: "packingSlip" })) },
      },
    });

    const lotIds: string[] = [];
    const lines: { documents: number; poItem: (typeof poItems)[number]; lotNumbers: string[]; remainder: number; overReceived: boolean; hasIssue: boolean; received: number }[] = [];

    for (const line of input.lines) {
      const poItem = byId.get(line.purchaseOrderItemId)!;
      const plan = planLine(poItem.quantity, line.lots.map((l) => l.quantity));
      const hasIssue = failedChecks(line.checks).length > 0;

      const receiptLine = await tx.receiptLine.create({
        data: {
          receiptId: receipt.id,
          purchaseOrderItemId: poItem.id,
          openQuantity: poItem.quantity,
          receivedQuantity: plan.received,
          checks: line.checks,
          hasIssue,
          issueNote: line.issueNote?.trim() || null,
          files: { create: line.photoFileIds.map((fileId) => ({ fileId, kind: "photo", receiptId: receipt.id })) },
        },
      });

      const copyDetails = poItem.details.map((d) => ({ expectedDateStart: d.expectedDateStart, expectedDateEnd: d.expectedDateEnd }));
      const lineLotIds: string[] = [];
      const lotNumbers: string[] = [];

      for (let index = 0; index < line.lots.length; index++) {
        const lotInput = line.lots[index];
        const lot = await tx.lot.create({
          data: {
            itemId: poItem.itemId,
            lotNumber: generateLotNumber(poItem.item.referenceCode),
            initialQuantity: converted.get(poItem.id)![index],
            uomId: poItem.item.inventoryUomId,
            supplierLotNumber: cleanSupplierLot(lotInput.supplierLotNumber),
            expiresAt: lotInput.expiresAt,
            manufacturedAt: lotInput.manufacturedAt,
            receiptLineId: receiptLine.id,
            lotOrigin: { create: { purchaseOrderId: poItem.purchaseOrderId, originType: "purchaseOrderReceiving" } },
          },
        });
        lineLotIds.push(lot.id);
        lotNumbers.push(lot.lotNumber);

        // the first lot takes over the PO line itself; each further supplier lot gets its own row
        const row = { quantity: lotInput.quantity, purchaseOrderStatusId: purchaseOrderStatuses.received, lotId: lot.id };
        if (index === 0) {
          await tx.purchaseOrderItem.update({ where: { id: poItem.id }, data: row });
        } else {
          await tx.purchaseOrderItem.create({
            data: {
              ...row,
              purchaseOrderId: poItem.purchaseOrderId,
              itemId: poItem.itemId,
              pricePerUnit: poItem.pricePerUnit,
              uomId: poItem.uomId,
              details: { create: copyDetails },
            },
          });
        }

        if (lotInput.linkDocumentIds.length > 0) {
          await tx.itemFile.updateMany({
            where: { id: { in: lotInput.linkDocumentIds }, itemId: poItem.itemId, lotId: null, supersededAt: null },
            data: { lotId: lot.id },
          });
        }
      }

      if (plan.remainder > 0) {
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: poItem.purchaseOrderId,
            itemId: poItem.itemId,
            quantity: plan.remainder,
            pricePerUnit: poItem.pricePerUnit,
            uomId: poItem.uomId,
            purchaseOrderStatusId: purchaseOrderStatuses.partiallyReceived,
            details: { create: copyDetails },
          },
        });
      }

      // documents uploaded at the dock, filed like the Files tab does
      for (const doc of line.documents) {
        const lotInput = doc.lotIndex !== null ? line.lots[doc.lotIndex] : null;
        const itemFile = await tx.itemFile.create({
          data: {
            itemId: poItem.itemId,
            fileId: doc.fileId,
            fileTypeId: doc.fileTypeId,
            issuer: "supplier",
            supplierId: poItem.purchaseOrders.supplierId,
            purchaseOrderId: poItem.purchaseOrderId,
            lotId: doc.lotIndex !== null ? lineLotIds[doc.lotIndex] : null,
            supplierLotNumber: cleanSupplierLot(lotInput?.supplierLotNumber),
            issuedAt: doc.issuedAt,
            expiresAt: doc.expiresAt,
          },
        });
        await supersedeOlderItemFiles(tx, itemFile.id, { now });
      }

      lotIds.push(...lineLotIds);
      lines.push({ documents: line.documents.length, poItem, lotNumbers, remainder: plan.remainder, overReceived: plan.overReceived, hasIssue, received: plan.received });
    }

    const stillOpen = await tx.purchaseOrderItem.count({
      where: { purchaseOrderId: input.purchaseOrderId, purchaseOrderStatusId: { in: receivableStatuses } },
    });
    const statusId = stillOpen === 0 ? purchaseOrderStatuses.received : purchaseOrderStatuses.partiallyReceived;
    await tx.purchaseOrder.update({ where: { id: input.purchaseOrderId }, data: { statusId } });

    return { receipt, lotIds, lines, statusId };
  }, { timeout: 30_000 });

  await logReceipt(userId, input, result);
  return {
    ok: true,
    receiptId: result.receipt.id,
    lotIds: result.lotIds,
    items: result.lines.map(({ poItem, remainder }) => ({
      itemId: poItem.itemId,
      stillExpected: remainder > 0,
      triggersPricing: !!poItem.item.itemType?.config?.isPricingExaminationTriggerEnabled,
    })),
  };
};

type Logged = {
  lines: { documents: number; poItem: { itemId: string; item: { name: string }; uom: { abbreviation: string }; purchaseOrders: { referenceCode: number; statusId: string } }; lotNumbers: string[]; remainder: number; overReceived: boolean; hasIssue: boolean; received: number }[];
  statusId: string;
};

const logReceipt = async (userId: string, input: ReceiveInput, result: Logged) => {
  const entries = result.lines.flatMap(({ documents, poItem, lotNumbers, remainder, overReceived, hasIssue, received }) => {
    const po = `PO #${poItem.purchaseOrders.referenceCode}`;
    const qty = `${received} ${poItem.uom.abbreviation}`;
    const lotList = lotNumbers.join(", ");
    return [
      { entityType: "item", entityId: poItem.itemId, action: "Lot Created", context: `${lotNumbers.length === 1 ? "Lot" : "Lots"} ${lotList} created from receiving ${po}` },
      {
        entityType: "purchaseOrder",
        entityId: input.purchaseOrderId,
        action: remainder > 0 ? "Item Partially Received" : "Item Received",
        context: `${poItem.item.name}: received ${qty} as ${lotList}` +
          (remainder > 0 ? `, ${remainder} ${poItem.uom.abbreviation} still expected` : "") +
          (overReceived ? " (more than ordered)" : "") +
          (hasIssue ? " (failed inspection)" : ""),
      },
      ...(documents > 0
        ? [{ entityType: "item", entityId: poItem.itemId, action: "uploadFile", context: `Uploaded ${documents === 1 ? "a document" : `${documents} documents`} while receiving ${po}` }]
        : []),
    ];
  });

  const previousStatus = result.lines[0]?.poItem.purchaseOrders.statusId;
  if (previousStatus !== result.statusId) {
    entries.push({
      entityType: "purchaseOrder",
      entityId: input.purchaseOrderId,
      action: "Update PO Status",
      context: `Status changed to ${result.statusId === purchaseOrderStatuses.received ? "Received" : "Partially Received"}`,
    });
  }

  await prisma.activityLog.createMany({
    data: entries.map((e) => ({ userId, action: e.action, entityType: e.entityType, entityId: e.entityId, details: { context: e.context } })),
  });
};
