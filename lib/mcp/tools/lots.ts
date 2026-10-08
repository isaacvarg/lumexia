import { z } from "zod";
import prisma from "@/lib/prisma";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem, getLotQuantities } from "../lookups";
import { getLotReceipt } from "@/lib/receiving/lots";

const originSelect = {
  originType: true,
  purchaseOrder: { select: { referenceCode: true, supplier: { select: { name: true } } } },
  bpr: { select: { referenceCode: true } },
} as const;

type OriginRow = {
  originType: string;
  purchaseOrder: { referenceCode: number; supplier: { name: string } } | null;
  bpr: { referenceCode: number } | null;
} | null;

const describeOrigin = (origin: OriginRow) =>
  origin && {
    type: origin.originType,
    purchaseOrder: origin.purchaseOrder && {
      referenceCode: origin.purchaseOrder.referenceCode,
      supplier: origin.purchaseOrder.supplier.name,
    },
    bprReferenceCode: origin.bpr?.referenceCode ?? null,
  };

export const registerLotTools: ToolRegistrar = (server) => {
  server.registerTool(
    "get_item_lots",
    {
      title: "Get item lots",
      description:
        "Lots of an item with quantity on hand and where each came from (purchase order or batch). " +
        "By default only lots with stock, newest first.",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
        includeDepleted: z.boolean().optional().describe("Also include lots with nothing on hand (default false)"),
        limit: z.number().int().min(1).max(200).optional().describe("Max lots (default 50)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier, includeDepleted, limit }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);

      const lots = await prisma.lot.findMany({
        where: { itemId: item.id },
        select: {
          id: true,
          lotNumber: true,
          supplierLotNumber: true,
          expiresAt: true,
          initialQuantity: true,
          createdAt: true,
          uom: { select: { abbreviation: true } },
          lotOrigin: { select: originSelect },
        },
        orderBy: { createdAt: "desc" },
      });

      const onHand = await getLotQuantities(lots);
      const rows = lots
        .map((lot) => ({
          id: lot.id,
          lotNumber: lot.lotNumber,
          supplierLot: lot.supplierLotNumber,
          expires: lot.expiresAt?.toISOString().slice(0, 10) ?? null,
          onHand: onHand.get(lot.id) ?? lot.initialQuantity,
          initialQuantity: lot.initialQuantity,
          uom: lot.uom.abbreviation,
          receivedOrMadeAt: lot.createdAt,
          origin: describeOrigin(lot.lotOrigin),
        }))
        .filter((lot) => includeDepleted || lot.onHand > 0);

      const max = limit ?? 50;
      return jsonResult({
        item,
        totalLots: rows.length,
        truncated: rows.length > max,
        lots: rows.slice(0, max),
      });
    },
  );

  server.registerTool(
    "get_lot",
    {
      title: "Get lot",
      description:
        "One lot by our lot number or the supplier's lot number: its item, supplier lot and dates, quantity on hand, " +
        "origin, how it was received (inspection, flags), QC records with parameter results, and notes. " +
        "Lot numbers are not unique across items, so this can return several lots.",
      inputSchema: {
        lotNumber: z.string().min(1).describe("Our lot number as printed on the label, or the supplier's lot number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ lotNumber }) => {
      const lots = await prisma.lot.findMany({
        where: {
          OR: [
            { lotNumber: { equals: lotNumber.trim(), mode: "insensitive" } },
            { supplierLotNumber: { equals: lotNumber.trim(), mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          lotNumber: true,
          supplierLotNumber: true,
          expiresAt: true,
          manufacturedAt: true,
          initialQuantity: true,
          createdAt: true,
          item: { select: { id: true, name: true, referenceCode: true } },
          uom: { select: { abbreviation: true } },
          lotOrigin: { select: originSelect },
          qcRecords: {
            orderBy: { createdAt: "desc" },
            select: {
              referenceCode: true,
              createdAt: true,
              status: { select: { name: true } },
              examinationType: { select: { name: true } },
              conductedBy: { select: { name: true } },
              qcParameterResults: {
                orderBy: { runNumber: "asc" },
                select: {
                  value: true,
                  runNumber: true,
                  qcItemParameter: { select: { parameter: { select: { name: true, uom: true } } } },
                },
              },
            },
          },
          notes: {
            orderBy: { createdAt: "desc" },
            select: { content: true, createdAt: true, user: { select: { name: true } }, noteType: { select: { name: true } } },
          },
        },
      });

      if (lots.length === 0) return errorResult(`No lot found with lot number "${lotNumber}".`);

      const onHand = await getLotQuantities(lots);
      const receipts = new Map(await Promise.all(lots.map(async (l) => [l.id, await getLotReceipt(l.id)] as const)));

      return jsonResult(
        lots.map((lot) => ({
          id: lot.id,
          lotNumber: lot.lotNumber,
          supplierLot: lot.supplierLotNumber,
          expires: lot.expiresAt?.toISOString().slice(0, 10) ?? null,
          manufactured: lot.manufacturedAt?.toISOString().slice(0, 10) ?? null,
          item: lot.item,
          onHand: onHand.get(lot.id) ?? lot.initialQuantity,
          initialQuantity: lot.initialQuantity,
          uom: lot.uom.abbreviation,
          receivedOrMadeAt: lot.createdAt,
          origin: describeOrigin(lot.lotOrigin),
          receiving: (() => {
            const r = receipts.get(lot.id);
            return r && {
              receivedAt: r.receivedAt,
              receivedBy: r.receivedBy,
              packingSlip: r.packingSlipNumber,
              failedChecks: r.failedChecks,
              issueNote: r.issueNote,
              photos: r.photos.length,
              flags: r.flags,
            };
          })(),
          qcRecords: lot.qcRecords.map((qc) => ({
            referenceCode: qc.referenceCode,
            examination: qc.examinationType.name,
            status: qc.status.name,
            conductedBy: qc.conductedBy.name,
            createdAt: qc.createdAt,
            results: qc.qcParameterResults.map((r) => ({
              parameter: r.qcItemParameter.parameter.name,
              value: r.value,
              uom: r.qcItemParameter.parameter.uom,
              run: r.runNumber,
            })),
          })),
          notes: lot.notes.map((n) => ({ type: n.noteType.name, content: n.content, by: n.user.name, at: n.createdAt })),
        })),
      );
    },
  );
};
