import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { serializeInventoryType, serializeItem, serializeLot, serializeType, type ItemRow } from "./serialize";
import { toPage } from "./params";

// Everything that is not "active" (inactive or archived) is reported as archived.
const itemSelect = {
  id: true,
  referenceCode: true,
  name: true,
  itemTypeId: true,
  procurementTypeId: true,
  inventoryTypeId: true,
  updatedAt: true,
  recordStatusId: true,
  aliases: { select: { name: true, updatedAt: true } },
} satisfies Prisma.ItemSelect;

type ItemRecord = Prisma.ItemGetPayload<{ select: typeof itemSelect }>;

const toItemRow = ({ recordStatusId, ...rest }: ItemRecord): ItemRow => ({
  ...rest,
  archived: recordStatusId !== recordStatuses.active,
});

export type ItemFilters = {
  q: string | null;
  referenceCodes: string[] | null;
  ids: string[] | null;
  updatedSince: Date | null;
  includeArchived: boolean;
};

// Case-insensitive exact match on reference code or any alias, via the lower() expression indexes.
const idsMatchingCodes = async (codes: string[]) => {
  const lowered = codes.map((c) => c.toLowerCase());
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT id FROM items WHERE lower(reference_code) = ANY(${lowered})
    UNION
    SELECT item_id AS id FROM aliases WHERE lower(name) = ANY(${lowered})
  `);
  return rows.map((r) => r.id);
};

export const listItems = async (filters: ItemFilters, cursor: string | null, limit: number) => {
  const and: Prisma.ItemWhereInput[] = [];

  if (!filters.includeArchived) and.push({ recordStatusId: recordStatuses.active });
  if (filters.ids) and.push({ id: { in: filters.ids } });
  if (filters.referenceCodes) and.push({ id: { in: await idsMatchingCodes(filters.referenceCodes) } });
  if (filters.q) {
    const contains = { contains: filters.q, mode: "insensitive" as const };
    and.push({ OR: [{ name: contains }, { referenceCode: contains }, { aliases: { some: { name: contains } } }] });
  }
  if (filters.updatedSince) {
    and.push({
      OR: [{ updatedAt: { gt: filters.updatedSince } }, { aliases: { some: { updatedAt: { gt: filters.updatedSince } } } }],
    });
  }
  if (cursor) and.push({ id: { gt: cursor } });

  const rows = await prisma.item.findMany({
    where: { AND: and },
    select: itemSelect,
    orderBy: { id: "asc" },
    take: limit + 1,
  });
  const page = toPage(rows, limit);
  return { items: page.items.map((r) => serializeItem(toItemRow(r))), nextCursor: page.nextCursor };
};

export const getItem = async (id: string) => {
  const row = await prisma.item.findUnique({ where: { id }, select: itemSelect });
  return row ? serializeItem(toItemRow(row)) : null;
};

export const listLots = async (
  filters: { lotNumber: string | null; itemId: string | null },
  cursor: string | null,
  limit: number,
) => {
  // Raw so the case-insensitive match uses lower(lot_number) and its index.
  const conditions: Prisma.Sql[] = [];
  if (filters.lotNumber) conditions.push(Prisma.sql`lower(lot_number) = lower(${filters.lotNumber})`);
  if (filters.itemId) conditions.push(Prisma.sql`item_id = ${filters.itemId}`);
  if (cursor) conditions.push(Prisma.sql`id > ${cursor}`);
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;

  const rows = await prisma.$queryRaw<{ id: string; itemId: string; lotNumber: string; createdAt: Date }[]>(Prisma.sql`
    SELECT id, item_id AS "itemId", lot_number AS "lotNumber", created_at AS "createdAt"
    FROM lots ${where} ORDER BY id ASC LIMIT ${limit + 1}
  `);
  const page = toPage(rows, limit);
  return { lots: page.items.map(serializeLot), nextCursor: page.nextCursor };
};

export const getLot = async (id: string) => {
  const row = await prisma.lot.findUnique({ where: { id }, select: { id: true, itemId: true, lotNumber: true, createdAt: true } });
  return row ? serializeLot(row) : null;
};

export type TypeKind = "itemTypes" | "procurementTypes" | "inventoryTypes";

export const listTypes = async (kind: TypeKind, cursor: string | null, limit: number) => {
  const args = { where: cursor ? { id: { gt: cursor } } : {}, orderBy: { id: "asc" as const }, take: limit + 1 };
  if (kind === "inventoryTypes") {
    const page = toPage(await prisma.inventoryType.findMany({ ...args, select: { id: true, name: true, isTracked: true } }), limit);
    return { inventoryTypes: page.items.map(serializeInventoryType), nextCursor: page.nextCursor };
  }
  const select = { id: true, name: true };
  const rows = kind === "itemTypes" ? await prisma.itemType.findMany({ ...args, select }) : await prisma.procurementType.findMany({ ...args, select });
  const page = toPage(rows, limit);
  return { [kind]: page.items.map(serializeType), nextCursor: page.nextCursor };
};
