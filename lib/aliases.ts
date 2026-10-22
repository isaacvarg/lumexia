import prisma from "@/lib/prisma";
import type { Db } from "@/lib/canon/db";
import { aliasTypes } from "@/configs/staticRecords/aliasTypes";

// Item aliases written by agents (MCP). Alias types flagged unique (e.g. a WooCommerce product id) identify
// one item, so the same name can't be given to two items. Every change is logged on the item like the
// Basics tab does, and a removal keeps the old name in that log.

const normalized = (name: string) => name.trim();

// The item that already holds this name under a unique type, if any (case-insensitive).
export const findUniqueAliasConflict = async (
  input: { aliasTypeId: string; name: string; excludeAliasId?: string },
  db: Db = prisma,
) => {
  const type = await db.aliasType.findUnique({ where: { id: input.aliasTypeId }, select: { isUnique: true } });
  if (!type?.isUnique) return null;

  const existing = await db.alias.findFirst({
    where: {
      aliasTypeId: input.aliasTypeId,
      name: { equals: normalized(input.name), mode: "insensitive" },
      ...(input.excludeAliasId && { id: { not: input.excludeAliasId } }),
    },
    select: { id: true, item: { select: { id: true, name: true, referenceCode: true } } },
  });
  return existing ? { aliasId: existing.id, item: existing.item } : null;
};

// Names shared by more than one alias of a type, which must be cleaned up before the type can be unique.
export const findDuplicateAliasNames = async (aliasTypeId: string) => {
  const aliases = await prisma.alias.findMany({ where: { aliasTypeId }, select: { name: true } });
  const counts = new Map<string, number>();
  aliases.forEach((a) => counts.set(normalized(a.name).toLowerCase(), (counts.get(normalized(a.name).toLowerCase()) ?? 0) + 1));
  return Array.from(counts.entries()).filter(([, n]) => n > 1).map(([name]) => name);
};

export class AliasConflict extends Error {
  constructor(readonly owner: { id: string; name: string; referenceCode: string }, typeName: string, name: string) {
    super(`"${name}" is already the ${typeName} alias of ${owner.name} (${owner.referenceCode}).`);
  }
}

const log = (db: Db, userId: string, action: string, itemId: string, details: Record<string, unknown>) =>
  db.activityLog.create({ data: { userId, action, entityType: "item", entityId: itemId, details: details as any } });

const aliasSelect = {
  id: true,
  name: true,
  aliasType: { select: { id: true, name: true } },
  supplierAlias: { select: { supplier: { select: { id: true, name: true } } } },
} as const;

const describe = (alias: { id: string; name: string; aliasType: { id: string; name: string }; supplierAlias: { supplier: { id: string; name: string } }[] }) => ({
  aliasId: alias.id,
  alias: alias.name,
  aliasType: alias.aliasType.name,
  supplier: alias.supplierAlias[0]?.supplier.name ?? null,
});

type LogContext = { details?: Record<string, unknown> };

export const addItemAlias = async (
  db: Db,
  userId: string,
  input: { itemId: string; aliasTypeId: string; name: string; supplierId?: string | null } & LogContext,
) => {
  const name = normalized(input.name);
  if (!name) throw new Error("An alias needs a name.");
  const type = await db.aliasType.findUniqueOrThrow({ where: { id: input.aliasTypeId } });
  if (type.id === aliasTypes.supplier && !input.supplierId) throw new Error("A supplier alias needs the supplier it comes from.");

  const conflict = await findUniqueAliasConflict({ aliasTypeId: type.id, name }, db);
  if (conflict) {
    if (conflict.item.id === input.itemId) throw new Error(`This item already has the ${type.name} alias "${name}".`);
    throw new AliasConflict(conflict.item, type.name, name);
  }

  const duplicate = await db.alias.findFirst({
    where: { itemId: input.itemId, aliasTypeId: type.id, name: { equals: name, mode: "insensitive" } },
  });
  if (duplicate) throw new Error(`This item already has the ${type.name} alias "${name}".`);

  const alias = await db.alias.create({
    data: {
      name,
      aliasTypeId: type.id,
      itemId: input.itemId,
      ...(type.id === aliasTypes.supplier && { supplierAlias: { create: { supplierId: input.supplierId! } } }),
    },
    select: aliasSelect,
  });
  await log(db, userId, "createAlias", input.itemId, {
    context: `${name} was created.`,
    aliasType: type.name,
    ...input.details,
  });
  return describe(alias);
};

// Renames an alias and/or moves it to another type. Moving to or from the supplier type needs the supplier link
// adjusted, which only the Basics tab does today, so agents can't change that.
export const updateItemAlias = async (
  db: Db,
  userId: string,
  input: { aliasId: string; name?: string; aliasTypeId?: string } & LogContext,
) => {
  const current = await db.alias.findUniqueOrThrow({ where: { id: input.aliasId }, include: { aliasType: true } });
  const name = input.name !== undefined ? normalized(input.name) : current.name;
  if (!name) throw new Error("An alias needs a name.");
  const type = input.aliasTypeId ? await db.aliasType.findUniqueOrThrow({ where: { id: input.aliasTypeId } }) : current.aliasType;
  if ((type.id === aliasTypes.supplier) !== (current.aliasTypeId === aliasTypes.supplier)) {
    throw new Error("Changing an alias to or from the supplier type has to be done in the item's Basics tab.");
  }
  if (name === current.name && type.id === current.aliasTypeId) throw new Error("Nothing to change.");

  const conflict = await findUniqueAliasConflict({ aliasTypeId: type.id, name, excludeAliasId: current.id }, db);
  if (conflict) throw new AliasConflict(conflict.item, type.name, name);

  const alias = await db.alias.update({ where: { id: current.id }, data: { name, aliasTypeId: type.id }, select: aliasSelect });
  await log(db, userId, "modifyAlias", current.itemId, {
    context:
      name !== current.name
        ? `Alias was modified from ${current.name} to ${name}.`
        : `${name} was changed from ${current.aliasType.name} to ${type.name}.`,
    from: { name: current.name, aliasType: current.aliasType.name },
    to: { name, aliasType: type.name },
    ...input.details,
  });
  return describe(alias);
};

// Deletes the alias; the activity log on the item keeps what it was.
export const removeItemAlias = async (db: Db, userId: string, input: { aliasId: string } & LogContext) => {
  const current = await db.alias.findUniqueOrThrow({ where: { id: input.aliasId }, select: { ...aliasSelect, itemId: true } });
  await db.supplierAlias.deleteMany({ where: { aliasId: current.id } });
  await db.alias.delete({ where: { id: current.id } });
  await log(db, userId, "deleteAlias", current.itemId, {
    context: `${current.name} was removed.`,
    removed: describe(current),
    ...input.details,
  });
  return describe(current);
};
