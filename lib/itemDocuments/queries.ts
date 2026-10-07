import { Prisma } from "@prisma/client";
import { Db } from "@/lib/canon/db";
import { getLotQuantities } from "@/lib/mcp/lookups";
import { evaluateItemDocuments } from "./evaluate";
import { EvaluatedRequirement } from "./types";

export type ItemDocumentStatus = {
  itemId: string;
  requirements: EvaluatedRequirement[];
};

// Evaluates every matching item in one pass: rules, current documents and (only when some rule is
// lot-scoped) lots are loaded in bulk, so this is safe to run across the whole item list.
export const getItemDocumentStatuses = async (
  db: Db,
  where: Prisma.ItemWhereInput = {},
  now: Date = new Date()
): Promise<ItemDocumentStatus[]> => {
  const rules = await db.itemDocumentRequirement.findMany();
  const needsLots = rules.some((r) => r.scope === "lot" && r.level !== "excluded");

  const items = await db.item.findMany({
    where,
    select: {
      id: true,
      itemTypeId: true,
      procurementTypeId: true,
      isSold: true,
      ItemFile: {
        where: { supersededAt: null },
        select: {
          id: true,
          fileTypeId: true,
          issuer: true,
          lotId: true,
          supplierId: true,
          issuedAt: true,
          expiresAt: true,
          supersededAt: true,
          derivedFrom: { select: { supersededAt: true } },
        },
      },
      lot: {
        where: needsLots ? {} : { id: { in: [] } },
        select: {
          id: true,
          lotNumber: true,
          initialQuantity: true,
          createdAt: true,
          lotOrigin: { select: { originType: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const onHand = await getLotQuantities(
    items.flatMap((i) => i.lot),
    db
  );

  return items.map((item) => ({
    itemId: item.id,
    requirements: evaluateItemDocuments(
      rules,
      item,
      item.ItemFile,
      item.lot.map((l) => ({
        id: l.id,
        lotNumber: l.lotNumber,
        originType: l.lotOrigin?.originType ?? null,
        createdAt: l.createdAt,
        onHand: onHand.get(l.id) ?? l.initialQuantity,
      })),
      now
    ),
  }));
};

export const getItemDocumentStatus = async (db: Db, itemId: string, now: Date = new Date()) => {
  const [status] = await getItemDocumentStatuses(db, { id: itemId }, now);
  return status ?? null;
};
