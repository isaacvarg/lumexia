import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiKeyScopes } from "@/lib/apiKeys";
import { AliasConflict, addItemAlias, removeItemAlias, updateItemAlias } from "@/lib/aliases";
import type { McpContext, ToolRegistrar } from "../server";
import { errorResult, jsonResult } from "../results";
import { findItem, findSupplier } from "../lookups";
import { actingForArg, resolveActor, type Actor } from "../actingFor";
import { runWrite } from "../writes";

// Item aliases (website ids, INCI names, trade names...). Alias types are managed by people in
// Settings → Inventory; agents use the existing ones. Types marked unique map one name to one item, so
// a WooCommerce product id can't end up on two items. Changes are logged on the item.

const aliasTypeArg = z.string().min(1).describe("Alias type name (e.g. INCI Name, Supplier, WooCommerce ID) or id; see list_alias_types");
const idempotencyKeyArg = z.string().min(8).max(200).describe("Unique per intended change; retrying with the same key returns the first result");
const dryRunArg = z.boolean().optional().describe("Validate and return the result without changing anything");

const findAliasType = async (identifier: string) => {
  const value = identifier.trim();
  const types = await prisma.aliasType.findMany({ select: { id: true, name: true, isUnique: true } });
  // match "woocommerce_id", "WooCommerce ID" and the id alike
  const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return types.find((t) => t.id === value) ?? types.find((t) => squash(t.name) === squash(value)) ?? null;
};

const findItemAlias = async (itemId: string, name: string, aliasTypeId?: string) => {
  const matches = await prisma.alias.findMany({
    where: { itemId, name: { equals: name.trim(), mode: "insensitive" }, ...(aliasTypeId && { aliasTypeId }) },
    select: { id: true },
    take: 2,
  });
  return matches;
};

const logDetails = (ctx: McpContext, actor: Actor) => ({
  via: "mcp",
  apiKeyId: ctx.keyId,
  ...(actor.actingFor && { onBehalfOf: { userId: actor.user.id, name: actor.user.name, ...actor.actingFor } }),
});

const failure = (error: unknown) => {
  if (error instanceof AliasConflict) return errorResult(`${error.message} ${JSON.stringify({ ownedBy: error.owner })}`);
  return errorResult(error instanceof Error ? error.message : String(error));
};

export const registerAliasReadTools: ToolRegistrar = (server) => {
  server.registerTool(
    "list_alias_types",
    {
      title: "List alias types",
      description: "The kinds of alias an item can have, and which are unique (one item per name, e.g. a WooCommerce product id).",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const types = await prisma.aliasType.findMany({
        select: { id: true, name: true, isUnique: true, _count: { select: { Alias: true } } },
        orderBy: { name: "asc" },
      });
      return jsonResult(types.map((t) => ({ id: t.id, name: t.name, unique: t.isUnique, aliases: t._count.Alias })));
    },
  );
};

export const registerAliasWriteTools: ToolRegistrar = (server, ctx) => {
  const isDelegate = ctx.scopes.includes(apiKeyScopes.delegate);
  const actingForSchema = (isDelegate ? { actingFor: actingForArg } : {}) as unknown as { actingFor: z.ZodOptional<typeof actingForArg> };

  server.registerTool(
    "add_item_alias",
    {
      title: "Add item alias",
      description:
        "Give an item another name or external id, e.g. its WooCommerce product id (aliasType 'WooCommerce ID', " +
        "alias '104420'). search_items matches aliases. For a unique type, a name already on another item is refused " +
        "and the owning item is returned. Supplier aliases need the supplier.",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
        alias: z.string().min(1).max(500),
        aliasType: aliasTypeArg,
        supplier: z.string().optional().describe("Supplier id or name; required for the Supplier alias type"),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ item: itemArg, alias, aliasType: typeArg, supplier: supplierArg, idempotencyKey, dryRun, actingFor }) => {
      const actor = await resolveActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      const item = await findItem(itemArg);
      if (!item) return errorResult(`No item found for "${itemArg}". Try search_items.`);
      const type = await findAliasType(typeArg);
      if (!type) return errorResult(`No alias type "${typeArg}". See list_alias_types; new types are added in Settings → Inventory.`);
      const supplier = supplierArg ? await findSupplier(supplierArg) : null;
      if (supplierArg && !supplier) return errorResult(`No single supplier matches "${supplierArg}". Use its id.`);

      try {
        const outcome = await runWrite(
          ctx,
          { tool: "add_item_alias", args: { item: item.id, alias, aliasType: type.id, supplier: supplier?.id, actingFor }, idempotencyKey, dryRun },
          async (db) => ({
            item,
            ...(await addItemAlias(db, ctx.user.id, {
              itemId: item.id,
              aliasTypeId: type.id,
              name: alias,
              supplierId: supplier?.id,
              details: logDetails(ctx, actor),
            })),
          }),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "update_item_alias",
    {
      title: "Update item alias",
      description: "Rename one of an item's aliases and/or move it to another alias type (not to or from Supplier).",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
        alias: z.string().min(1).describe("The alias as it is now"),
        aliasType: aliasTypeArg.optional().describe("Its current type, if the item has the same name under several types"),
        newAlias: z.string().min(1).max(500).optional(),
        newAliasType: aliasTypeArg.optional(),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ item: itemArg, alias, aliasType: typeArg, newAlias, newAliasType, idempotencyKey, dryRun, actingFor }) => {
      const actor = await resolveActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      if (!newAlias && !newAliasType) return errorResult("Pass newAlias, newAliasType, or both.");
      const item = await findItem(itemArg);
      if (!item) return errorResult(`No item found for "${itemArg}". Try search_items.`);
      const type = typeArg ? await findAliasType(typeArg) : null;
      if (typeArg && !type) return errorResult(`No alias type "${typeArg}". See list_alias_types.`);
      const newType = newAliasType ? await findAliasType(newAliasType) : null;
      if (newAliasType && !newType) return errorResult(`No alias type "${newAliasType}". See list_alias_types.`);

      const matches = await findItemAlias(item.id, alias, type?.id);
      if (matches.length === 0) return errorResult(`${item.name} has no alias "${alias}".`);
      if (matches.length > 1) return errorResult(`${item.name} has "${alias}" under several types; pass aliasType.`);

      try {
        const outcome = await runWrite(
          ctx,
          { tool: "update_item_alias", args: { aliasId: matches[0].id, newAlias, newAliasType: newType?.id, actingFor }, idempotencyKey, dryRun },
          async (db) => ({
            item,
            ...(await updateItemAlias(db, ctx.user.id, {
              aliasId: matches[0].id,
              name: newAlias,
              aliasTypeId: newType?.id,
              details: logDetails(ctx, actor),
            })),
          }),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "remove_item_alias",
    {
      title: "Remove item alias",
      description: "Remove one of an item's aliases. The item's activity log keeps what it was.",
      inputSchema: {
        item: z.string().min(1).describe("Item id or reference code"),
        alias: z.string().min(1),
        aliasType: aliasTypeArg.optional().describe("Its type, if the item has the same name under several types"),
        idempotencyKey: idempotencyKeyArg,
        dryRun: dryRunArg,
        ...actingForSchema,
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async ({ item: itemArg, alias, aliasType: typeArg, idempotencyKey, dryRun, actingFor }) => {
      const actor = await resolveActor(ctx, actingFor);
      if ("error" in actor) return errorResult(actor.error);
      const item = await findItem(itemArg);
      if (!item) return errorResult(`No item found for "${itemArg}". Try search_items.`);
      const type = typeArg ? await findAliasType(typeArg) : null;
      if (typeArg && !type) return errorResult(`No alias type "${typeArg}". See list_alias_types.`);

      // a retried removal finds nothing to match, so answer it from the idempotency record first
      const previous = await prisma.apiIdempotencyKey.findUnique({ where: { apiKeyId_key: { apiKeyId: ctx.keyId, key: idempotencyKey } } });
      const replaying = !!previous && !dryRun;
      const matches = replaying ? [] : await findItemAlias(item.id, alias, type?.id);
      if (!replaying && matches.length === 0) return errorResult(`${item.name} has no alias "${alias}".`);
      if (matches.length > 1) return errorResult(`${item.name} has "${alias}" under several types; pass aliasType.`);

      try {
        const outcome = await runWrite(
          ctx,
          { tool: "remove_item_alias", args: { item: item.id, alias: alias.trim().toLowerCase(), aliasType: type?.id, actingFor }, idempotencyKey, dryRun },
          async (db) => ({
            item,
            removed: await removeItemAlias(db, ctx.user.id, { aliasId: matches[0].id, details: logDetails(ctx, actor) }),
          }),
        );
        return jsonResult({ dryRun: outcome.dryRun, ...(outcome.replayed && { replayed: true }), ...outcome.result });
      } catch (error) {
        return failure(error);
      }
    },
  );
};
