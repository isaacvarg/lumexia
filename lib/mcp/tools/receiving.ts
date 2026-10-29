import { z } from "zod";
import { outOfSpecLotIds } from "@/lib/qcCoaImport/queries";
import prisma from "@/lib/prisma";
import { getItemDocumentStatuses } from "@/lib/itemDocuments/queries";
import { failedChecks, CheckAnswers } from "@/lib/receiving/checks";
import { lineFlags, lotFlags, ReceivingFlag } from "@/lib/receiving/flags";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";

const flagValues = ["inspection", "overReceived", "shortReceived", "noSupplierLot", "docsMissing", "lotMismatch", "outOfSpec"] as const satisfies readonly ReceivingFlag[];

const MAX_DAYS = 90;

export const registerReceivingTools: ToolRegistrar = (server, ctx) => {
  server.registerTool(
    "get_receiving_issues",
    {
      title: "Get receiving issues",
      description:
        "Deliveries received since a time whose lines need a look: failed dock inspection (inspection), more than " +
        "ordered (overReceived), less than ordered with the rest still open (shortReceived), a lot without the " +
        "supplier's lot number (noSupplierLot), a required lot document like the COA not on file (docsMissing), or a " +
        "lot document printed for another supplier lot (lotMismatch), or a supplier COA that failed the item's approved baseline (outOfSpec). Document flags reflect what's on file now, so " +
        "they clear once the document arrives. Poll with `since` set to the last check to notify people of new issues.",
      inputSchema: {
        since: z.string().datetime({ offset: true }).optional().describe("ISO time; receipts after this (default: last 24 hours)"),
        flags: z.array(z.enum(flagValues)).optional().describe("Only lines with any of these flags"),
        includeClean: z.boolean().optional().describe("Also return lines with no flags (default false)"),
        limit: z.number().int().min(1).max(200).optional().describe("Max receipt lines (default 50)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ since, flags, includeClean, limit }) => {
      const from = since ? new Date(since) : new Date(Date.now() - 24 * 3600 * 1000);
      if (Date.now() - from.getTime() > MAX_DAYS * 24 * 3600 * 1000) return errorResult(`since can be at most ${MAX_DAYS} days ago.`);

      const lines = await prisma.receiptLine.findMany({
        where: { receipt: { createdAt: { gt: from } } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          openQuantity: true,
          receivedQuantity: true,
          hasIssue: true,
          issueNote: true,
          checks: true,
          purchaseOrderItem: { select: { uom: { select: { abbreviation: true } }, item: { select: { id: true, name: true, referenceCode: true } } } },
          receipt: {
            select: {
              id: true,
              createdAt: true,
              packingSlipNumber: true,
              receivedBy: { select: { name: true } },
              purchaseOrder: { select: { id: true, referenceCode: true, supplier: { select: { name: true } } } },
            },
          },
          lots: { select: { id: true, lotNumber: true, supplierLotNumber: true } },
          files: { select: { id: true } },
        },
      });

      const itemIds = Array.from(new Set(lines.map((l) => l.purchaseOrderItem.item.id)));
      const statuses = await getItemDocumentStatuses(prisma, { id: { in: itemIds } });
      const requirements = new Map(statuses.map((s) => [s.itemId, s.requirements]));

      const outOfSpec = await outOfSpecLotIds(prisma, lines.flatMap((l) => l.lots.map((lot) => lot.id)));
      const rows = lines
        .map((line) => {
          const reqs = requirements.get(line.purchaseOrderItem.item.id) ?? [];
          const lots = line.lots.map((lot) => ({ lotNumber: lot.lotNumber, supplierLot: lot.supplierLotNumber, flags: lotFlags({ ...lot, outOfSpec: outOfSpec.has(lot.id) }, reqs) }));
          const all = Array.from(new Set([...lineFlags(line), ...lots.flatMap((l) => l.flags)]));
          const po = line.receipt.purchaseOrder;
          return {
            receivedAt: line.receipt.createdAt,
            receivedBy: line.receipt.receivedBy.name,
            purchaseOrder: { referenceCode: po.referenceCode, supplier: po.supplier.name },
            packingSlip: line.receipt.packingSlipNumber,
            item: line.purchaseOrderItem.item,
            received: `${line.receivedQuantity} of ${line.openQuantity} ${line.purchaseOrderItem.uom.abbreviation}`,
            flags: all,
            failedChecks: failedChecks(line.checks as CheckAnswers).map((c) => c.label),
            issueNote: line.issueNote,
            photos: line.files.length,
            lots,
            link: `${ctx.origin}/receiving/${po.referenceCode}?id=${po.id}`,
          };
        })
        .filter((r) => (flags?.length ? r.flags.some((f) => flags.includes(f as (typeof flagValues)[number])) : includeClean || r.flags.length > 0));

      const max = limit ?? 50;
      return jsonResult({
        since: from.toISOString(),
        checkedAt: new Date().toISOString(),
        matching: rows.length,
        truncated: rows.length > max,
        lines: rows.slice(0, max),
      });
    },
  );
};
