import { z } from "zod";
import prisma from "@/lib/prisma";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import type { ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem, getLotQuantities } from "../lookups";

export const registerItemTools: ToolRegistrar = (server) => {
  server.registerTool(
    "search_items",
    {
      title: "Search items",
      description:
        "Find items (raw materials, packaging, bulk, finished goods) by name, reference code, or alias " +
        "(e.g. INCI name, supplier trade name). Returns ids to use with the other tools.",
      inputSchema: {
        query: z.string().min(1).describe("Text to match against name, reference code, or any alias"),
        includeArchived: z.boolean().optional().describe("Include archived items (default false)"),
        limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, includeArchived, limit }) => {
      const contains = { contains: query.trim(), mode: "insensitive" as const };

      const items = await prisma.item.findMany({
        where: {
          ...(includeArchived ? {} : { recordStatusId: { not: recordStatuses.archived } }),
          OR: [{ name: contains }, { referenceCode: contains }, { aliases: { some: { name: contains } } }],
        },
        select: {
          id: true,
          name: true,
          referenceCode: true,
          itemType: { select: { name: true } },
          procurementType: { select: { name: true } },
          recordStatus: { select: { name: true } },
          aliases: { where: { name: contains }, select: { name: true, aliasType: { select: { name: true } } } },
        },
        orderBy: { name: "asc" },
        take: limit ?? 20,
      });

      return jsonResult(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          referenceCode: item.referenceCode,
          type: item.itemType.name,
          procurement: item.procurementType.name,
          status: item.recordStatus.name,
          matchedAliases: item.aliases.map((a) => ({ name: a.name, type: a.aliasType.name })),
        })),
      );
    },
  );

  server.registerTool(
    "get_item",
    {
      title: "Get item",
      description: "Details for one item: type, procurement, inventory unit, all aliases, and total quantity on hand.",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ item: identifier }) => {
      const found = await findItem(identifier);
      if (!found) return errorResult(`No item found for "${identifier}". Try search_items.`);

      const item = await prisma.item.findUniqueOrThrow({
        where: { id: found.id },
        select: {
          id: true,
          name: true,
          referenceCode: true,
          createdAt: true,
          itemType: { select: { name: true } },
          procurementType: { select: { name: true } },
          inventoryType: { select: { name: true } },
          recordStatus: { select: { name: true } },
          inventoryUom: { select: { name: true, abbreviation: true } },
          aliases: { select: { name: true, aliasType: { select: { name: true } } }, orderBy: { name: "asc" } },
          lot: { select: { id: true, initialQuantity: true } },
        },
      });

      const onHand = await getLotQuantities(item.lot);
      const totalOnHand = Array.from(onHand.values()).reduce((sum, qty) => sum + qty, 0);

      return jsonResult({
        id: item.id,
        name: item.name,
        referenceCode: item.referenceCode,
        type: item.itemType.name,
        procurement: item.procurementType.name,
        inventoryType: item.inventoryType.name,
        status: item.recordStatus.name,
        createdAt: item.createdAt,
        aliases: item.aliases.map((a) => ({ name: a.name, type: a.aliasType.name })),
        inventory: {
          uom: item.inventoryUom.abbreviation,
          totalOnHand,
          lotsWithStock: Array.from(onHand.values()).filter((qty) => qty > 0).length,
          totalLots: item.lot.length,
        },
      });
    },
  );
};
