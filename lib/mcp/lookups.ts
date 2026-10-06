import prisma from "@/lib/prisma";
import { Db } from "@/lib/canon/db";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Agents may hold either an item's id or the reference code people use day to day.
export const findItem = async (identifier: string) => {
  const value = identifier.trim();
  return prisma.item.findFirst({
    where: UUID_PATTERN.test(value) ? { id: value } : { referenceCode: { equals: value, mode: "insensitive" } },
    select: { id: true, name: true, referenceCode: true },
  });
};

// On-hand per lot: initial quantity plus additions minus deductions, summed in the database
// so items with long transaction histories stay cheap.
export const getLotQuantities = async (lots: { id: string; initialQuantity: number }[], db: Db = prisma) => {
  const [sums, transactionTypes] = await Promise.all([
    db.transaction.groupBy({
      by: ["lotId", "transactionTypeId"],
      where: { lotId: { in: lots.map((l) => l.id) } },
      _sum: { amount: true },
    }),
    db.transactionType.findMany({ select: { id: true, deduction: true } }),
  ]);

  const deducts = new Map(transactionTypes.map((t) => [t.id, t.deduction]));
  const onHand = new Map(lots.map((l) => [l.id, l.initialQuantity]));

  for (const sum of sums) {
    const amount = sum._sum.amount ?? 0;
    onHand.set(sum.lotId, (onHand.get(sum.lotId) ?? 0) + (deducts.get(sum.transactionTypeId) ? -amount : amount));
  }

  return onHand;
};
