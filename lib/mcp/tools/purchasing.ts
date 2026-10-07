import { z } from "zod";
import prisma from "@/lib/prisma";
import { purchaseOrderStatuses } from "@/configs/staticRecords/purchaseOrderStatuses";
import { requestStatuses } from "@/configs/staticRecords/requestStatuses";
import { requestPriorities } from "@/configs/staticRecords/requestPriorities";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem } from "../lookups";

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
const round = (n: number) => Math.round(n * 1e4) / 1e4;

// People write "PO 123", "#123" or just "123".
const referenceNumber = (value: string | number) => {
  const digits = String(value).match(/\d+/)?.[0];
  return digits ? Number(digits) : null;
};

const poStatusKeys = Object.keys(purchaseOrderStatuses) as [keyof typeof purchaseOrderStatuses, ...(keyof typeof purchaseOrderStatuses)[]];
const requestStatusKeys = Object.keys(requestStatuses) as [keyof typeof requestStatuses, ...(keyof typeof requestStatuses)[]];
const priorityKeys = Object.keys(requestPriorities) as [keyof typeof requestPriorities, ...(keyof typeof requestPriorities)[]];

// The requests dashboard hides these; they're done one way or another.
const closedRequestStatusIds: string[] = [
  requestStatuses.delivered,
  requestStatuses.requestCancelledDuplicateRequest,
  requestStatuses.discontinuedIngredient,
  requestStatuses.replacementIngredientFound,
];

const findSupplierIds = async (supplier: string) => {
  const contains = { contains: supplier.trim(), mode: "insensitive" as const };
  const suppliers = await prisma.supplier.findMany({
    where: { OR: [{ id: supplier.trim() }, { name: contains }, { supplierAlias: { some: { alias: { name: contains } } } }] },
    select: { id: true },
  });
  return suppliers.map((s) => s.id);
};

const poLineSelect = {
  quantity: true,
  pricePerUnit: true,
  item: { select: { id: true, name: true, referenceCode: true } },
  uom: { select: { abbreviation: true } },
  purchaseOrderStatus: { select: { name: true } },
} as const;

const describeLine = (line: {
  quantity: number;
  pricePerUnit: number;
  item: { id: string; name: string; referenceCode: string };
  uom: { abbreviation: string };
  purchaseOrderStatus: { name: string };
}) => ({
  item: line.item,
  quantity: line.quantity,
  uom: line.uom.abbreviation,
  pricePerUnit: line.pricePerUnit,
  lineTotal: round(line.quantity * line.pricePerUnit),
  status: line.purchaseOrderStatus.name,
});

const notesOf = (notes: { content: string; createdAt: Date; user: { name: string | null }; noteType: { name: string } }[]) =>
  notes.map((n) => ({ type: n.noteType.name, content: n.content, by: n.user.name, at: n.createdAt }));

const noteSelect = {
  select: { content: true, createdAt: true, user: { select: { name: true } }, noteType: { select: { name: true } } },
  orderBy: { createdAt: "desc" },
} as const;

export const registerPurchasingTools: ToolRegistrar = (server) => {
  server.registerTool(
    "search_purchase_orders",
    {
      title: "Search purchase orders",
      description:
        "Purchase orders, newest first, with supplier, status, lines (item, quantity, price per unit) and total. " +
        "Filter by supplier, item, status, or creation date. Cancelled orders are left out unless asked for.",
      inputSchema: {
        supplier: z.string().optional().describe("Supplier id, or part of its name or alias"),
        item: z.string().optional().describe("Only orders with this item (id or reference code)"),
        status: z.array(z.enum(poStatusKeys)).optional().describe("Only orders in these statuses"),
        createdAfter: z.string().date().optional().describe("YYYY-MM-DD, inclusive"),
        createdBefore: z.string().date().optional().describe("YYYY-MM-DD, exclusive"),
        limit: z.number().int().min(1).max(100).optional().describe("Max orders (default 25)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ supplier, item: itemIdentifier, status, createdAfter, createdBefore, limit }) => {
      const item = itemIdentifier ? await findItem(itemIdentifier) : null;
      if (itemIdentifier && !item) return errorResult(`No item found for "${itemIdentifier}". Try search_items.`);

      const supplierIds = supplier ? await findSupplierIds(supplier) : null;
      if (supplierIds?.length === 0) return errorResult(`No supplier matches "${supplier}". Try search_suppliers.`);

      const orders = await prisma.purchaseOrder.findMany({
        where: {
          supplierId: supplierIds ? { in: supplierIds } : undefined,
          statusId: status ? { in: status.map((s) => purchaseOrderStatuses[s]) } : { not: purchaseOrderStatuses.cancelled },
          purchaseOrderItems: item ? { some: { itemId: item.id } } : undefined,
          createdAt: {
            gte: createdAfter ? new Date(createdAfter) : undefined,
            lt: createdBefore ? new Date(createdBefore) : undefined,
          },
        },
        select: {
          referenceCode: true,
          createdAt: true,
          supplier: { select: { id: true, name: true } },
          status: { select: { name: true } },
          user: { select: { name: true } },
          purchaseOrderItems: { select: poLineSelect, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: limit ?? 25,
      });

      return jsonResult(
        orders.map((po) => {
          const lines = po.purchaseOrderItems.map(describeLine);
          return {
            referenceCode: po.referenceCode,
            supplier: po.supplier,
            status: po.status.name,
            submittedBy: po.user.name,
            created: day(po.createdAt),
            total: round(lines.reduce((sum, l) => sum + l.lineTotal, 0)),
            lines,
          };
        }),
      );
    },
  );

  server.registerTool(
    "get_purchase_order",
    {
      title: "Get purchase order",
      description:
        "One purchase order by reference code: supplier, status, payment method, lines with expected delivery and " +
        "received lot, total, accounting status (paid, packing slip), notes, and the purchasing requests it fills.",
      inputSchema: { referenceCode: z.union([z.number().int(), z.string()]).describe("PO reference code, e.g. 1234") },
      annotations: { readOnlyHint: true },
    },
    async ({ referenceCode }) => {
      const code = referenceNumber(referenceCode);
      if (code === null) return errorResult(`"${referenceCode}" isn't a PO reference code.`);

      const po = await prisma.purchaseOrder.findFirst({
        where: { referenceCode: code },
        select: {
          referenceCode: true,
          createdAt: true,
          updatedAt: true,
          supplier: { select: { id: true, name: true } },
          status: { select: { name: true } },
          user: { select: { name: true } },
          paymentMethod: { select: { methodName: true } },
          purchaseOrderItems: {
            orderBy: { createdAt: "asc" },
            select: {
              ...poLineSelect,
              lot: { select: { lotNumber: true } },
              details: { select: { expectedDateStart: true, expectedDateEnd: true }, orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
          poAccountingDetail: {
            select: {
              paid: true,
              packingSlipReceived: true,
              paperworkGivenToAdmin: true,
              status: { select: { name: true } },
              paymentMethod: { select: { methodName: true } },
            },
          },
          purchaseOrderNotes: noteSelect,
          poPublicNotes: noteSelect,
          poAccountingNotes: noteSelect,
          RequestPurchaseOrder: {
            select: { request: { select: { referenceCode: true, title: true, status: { select: { name: true } } } } },
          },
        },
      });

      if (!po) return errorResult(`No purchase order with reference code ${code}.`);

      const lines = po.purchaseOrderItems.map((line) => ({
        ...describeLine(line),
        expected: line.details[0] && { from: day(line.details[0].expectedDateStart), to: day(line.details[0].expectedDateEnd) },
        receivedLot: line.lot?.lotNumber ?? null,
      }));
      const accounting = po.poAccountingDetail;

      return jsonResult({
        referenceCode: po.referenceCode,
        supplier: po.supplier,
        status: po.status.name,
        submittedBy: po.user.name,
        created: day(po.createdAt),
        updated: day(po.updatedAt),
        paymentMethod: po.paymentMethod?.methodName ?? null,
        total: round(lines.reduce((sum, l) => sum + l.lineTotal, 0)),
        lines,
        accounting: accounting && {
          status: accounting.status.name,
          paid: accounting.paid,
          paymentMethod: accounting.paymentMethod?.methodName ?? null,
          packingSlipReceived: accounting.packingSlipReceived,
          paperworkGivenToAdmin: accounting.paperworkGivenToAdmin,
        },
        notes: notesOf(po.purchaseOrderNotes),
        publicNotes: notesOf(po.poPublicNotes),
        accountingNotes: notesOf(po.poAccountingNotes),
        requests: po.RequestPurchaseOrder.map(({ request }) => ({
          referenceCode: request.referenceCode,
          title: request.title,
          status: request.status.name,
        })),
      });
    },
  );

  server.registerTool(
    "get_item_purchase_history",
    {
      title: "Get item purchase history",
      description:
        "Every purchase order line for an item, newest first: supplier, quantity, unit, price per unit, and status. " +
        "lastPrice is the line pricing uses as the item's purchase price (the most recent one, whatever its status). " +
        "Compare prices only within the same unit.",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
        supplier: z.string().optional().describe("Only this supplier (id, or part of its name or alias)"),
        includeCancelled: z.boolean().optional().describe("Include lines on cancelled orders (default false)"),
        limit: z.number().int().min(1).max(200).optional().describe("Max lines (default 50)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier, supplier, includeCancelled, limit }) => {
      const item = await findItem(identifier);
      if (!item) return errorResult(`No item found for "${identifier}". Try search_items.`);

      const supplierIds = supplier ? await findSupplierIds(supplier) : null;
      if (supplierIds?.length === 0) return errorResult(`No supplier matches "${supplier}". Try search_suppliers.`);

      const lineSelect = {
        quantity: true,
        pricePerUnit: true,
        createdAt: true,
        uom: { select: { abbreviation: true } },
        purchaseOrderStatus: { select: { name: true } },
        purchaseOrders: {
          select: { referenceCode: true, supplier: { select: { name: true } }, status: { select: { name: true } } },
        },
      } as const;

      const [lines, last] = await Promise.all([
        prisma.purchaseOrderItem.findMany({
          where: {
            itemId: item.id,
            purchaseOrders: {
              supplierId: supplierIds ? { in: supplierIds } : undefined,
              statusId: includeCancelled ? undefined : { not: purchaseOrderStatuses.cancelled },
            },
          },
          select: lineSelect,
          orderBy: { createdAt: "desc" },
          take: limit ?? 50,
        }),
        // same query as getLastItemPrice, which pricing uses
        prisma.purchaseOrderItem.findFirst({ where: { itemId: item.id }, select: lineSelect, orderBy: { createdAt: "desc" } }),
      ]);

      const describe = (line: NonNullable<typeof last>) => ({
        purchaseOrder: line.purchaseOrders.referenceCode,
        supplier: line.purchaseOrders.supplier.name,
        ordered: day(line.createdAt),
        quantity: line.quantity,
        uom: line.uom.abbreviation,
        pricePerUnit: line.pricePerUnit,
        lineStatus: line.purchaseOrderStatus.name,
        orderStatus: line.purchaseOrders.status.name,
      });

      return jsonResult({ item, lastPrice: last && describe(last), lines: lines.map(describe) });
    },
  );

  server.registerTool(
    "search_purchasing_requests",
    {
      title: "Search purchasing requests",
      description:
        "Purchasing requests (asks to buy an item), most recently updated first, with status, priority, expected " +
        "delivery, suppliers, and linked purchase orders. By default only open requests, like the requests dashboard.",
      inputSchema: {
        item: z.string().optional().describe("Only requests for this item (id or reference code)"),
        supplier: z.string().optional().describe("Only requests tagged with or ordered from this supplier"),
        status: z.array(z.enum(requestStatusKeys)).optional().describe("Only these statuses (overrides includeClosed)"),
        priority: z.array(z.enum(priorityKeys)).optional(),
        includeClosed: z.boolean().optional().describe("Include delivered, cancelled and discontinued requests (default false)"),
        limit: z.number().int().min(1).max(100).optional().describe("Max requests (default 50)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ item: itemIdentifier, supplier, status, priority, includeClosed, limit }) => {
      const item = itemIdentifier ? await findItem(itemIdentifier) : null;
      if (itemIdentifier && !item) return errorResult(`No item found for "${itemIdentifier}". Try search_items.`);

      const supplierIds = supplier ? await findSupplierIds(supplier) : null;
      if (supplierIds?.length === 0) return errorResult(`No supplier matches "${supplier}". Try search_suppliers.`);

      const requests = await prisma.purchasingRequest.findMany({
        where: {
          itemId: item?.id,
          statusId: status
            ? { in: status.map((s) => requestStatuses[s]) }
            : includeClosed
              ? undefined
              : { notIn: closedRequestStatusIds },
          priorityId: priority ? { in: priority.map((p) => requestPriorities[p]) } : undefined,
          OR: supplierIds
            ? [
                { supplierTags: { some: { supplierId: { in: supplierIds } } } },
                { pos: { some: { po: { supplierId: { in: supplierIds } } } } },
              ]
            : undefined,
        },
        select: {
          referenceCode: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          expectedDateStart: true,
          expectedDateEnd: true,
          item: { select: { id: true, name: true, referenceCode: true } },
          status: { select: { name: true } },
          priority: { select: { name: true } },
          requestingUser: { select: { name: true } },
          supplierTags: { select: { supplier: { select: { name: true } } } },
          pos: {
            select: {
              po: { select: { referenceCode: true, supplier: { select: { name: true } }, status: { select: { name: true } } } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit ?? 50,
      });

      return jsonResult(
        requests.map((r) => ({
          referenceCode: r.referenceCode,
          title: r.title,
          item: r.item,
          status: r.status.name,
          priority: r.priority.name,
          requestedBy: r.requestingUser.name,
          created: day(r.createdAt),
          updated: day(r.updatedAt),
          expected: r.expectedDateStart || r.expectedDateEnd ? { from: day(r.expectedDateStart), to: day(r.expectedDateEnd) } : null,
          suppliers: Array.from(new Set([...r.supplierTags.map((t) => t.supplier.name), ...r.pos.map((p) => p.po.supplier.name)])),
          purchaseOrders: r.pos.map(({ po }) => ({ referenceCode: po.referenceCode, supplier: po.supplier.name, status: po.status.name })),
        })),
      );
    },
  );

  server.registerTool(
    "get_purchasing_request",
    {
      title: "Get purchasing request",
      description:
        "One purchasing request by reference code: item, status, priority, expected delivery, tagged suppliers, " +
        "linked purchase orders with their lines for the requested item, linked batches, the inventory snapshot " +
        "taken when it was requested, and notes.",
      inputSchema: { referenceCode: z.union([z.number().int(), z.string()]).describe("Request reference code") },
      annotations: { readOnlyHint: true },
    },
    async ({ referenceCode }) => {
      const code = referenceNumber(referenceCode);
      if (code === null) return errorResult(`"${referenceCode}" isn't a request reference code.`);

      const request = await prisma.purchasingRequest.findFirst({
        where: { referenceCode: code },
        select: {
          referenceCode: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          expectedDateStart: true,
          expectedDateEnd: true,
          itemId: true,
          item: { select: { id: true, name: true, referenceCode: true } },
          status: { select: { name: true } },
          priority: { select: { name: true } },
          requestingUser: { select: { name: true } },
          supplierTags: { select: { supplier: { select: { id: true, name: true } } } },
          pos: {
            select: {
              po: {
                select: {
                  referenceCode: true,
                  supplier: { select: { name: true } },
                  status: { select: { name: true } },
                  purchaseOrderItems: {
                    select: {
                      ...poLineSelect,
                      itemId: true,
                      lot: { select: { lotNumber: true } },
                      details: { select: { expectedDateStart: true, expectedDateEnd: true }, orderBy: { createdAt: "desc" }, take: 1 },
                    },
                  },
                },
              },
            },
          },
          bprs: {
            select: {
              bpr: {
                select: {
                  referenceCode: true,
                  status: { select: { name: true } },
                  mbpr: { select: { producesItem: { select: { name: true } } } },
                },
              },
            },
          },
          requestInventorySnapshots: {
            select: {
              createdAt: true,
              onHandQuantity: true,
              allocatedQuantity: true,
              availableQuantity: true,
              warningShown: true,
              warningOverridden: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          RequestNote: noteSelect,
        },
      });

      if (!request) return errorResult(`No purchasing request with reference code ${code}.`);

      const snapshot = request.requestInventorySnapshots[0];

      return jsonResult({
        referenceCode: request.referenceCode,
        title: request.title,
        item: request.item,
        status: request.status.name,
        priority: request.priority.name,
        requestedBy: request.requestingUser.name,
        created: day(request.createdAt),
        updated: day(request.updatedAt),
        expected:
          request.expectedDateStart || request.expectedDateEnd
            ? { from: day(request.expectedDateStart), to: day(request.expectedDateEnd) }
            : null,
        taggedSuppliers: request.supplierTags.map((t) => t.supplier),
        purchaseOrders: request.pos.map(({ po }) => ({
          referenceCode: po.referenceCode,
          supplier: po.supplier.name,
          status: po.status.name,
          linesForItem: po.purchaseOrderItems
            .filter((line) => line.itemId === request.itemId)
            .map((line) => ({
              ...describeLine(line),
              expected: line.details[0] && { from: day(line.details[0].expectedDateStart), to: day(line.details[0].expectedDateEnd) },
              receivedLot: line.lot?.lotNumber ?? null,
            })),
        })),
        batches: request.bprs.map(({ bpr }) => ({
          referenceCode: bpr.referenceCode,
          status: bpr.status.name,
          produces: bpr.mbpr.producesItem.name,
        })),
        inventoryWhenRequested: snapshot && {
          at: day(snapshot.createdAt),
          onHand: snapshot.onHandQuantity,
          allocated: snapshot.allocatedQuantity,
          available: round(snapshot.availableQuantity),
          lowStockWarningShown: snapshot.warningShown,
          warningOverridden: snapshot.warningOverridden,
        },
        notes: notesOf(request.RequestNote),
      });
    },
  );
};
